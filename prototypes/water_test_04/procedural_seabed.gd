@tool
extends MeshInstance3D
## v28 prototype: coastal seabed, generated as a regular indexed grid.
## Place at the coast, orient so +Z points seaward. Position its origin
## at the *existing beach edge* (y = water_level); do not overlap dry terrain.
## Mesh covers local X +/- half_width and Z 0..length.
## This is an additive prototype, not a replacement for existing terrain.

@export_range(20.0, 500.0, 1.0) var width: float = 180.0
@export_range(20.0, 500.0, 1.0) var length: float = 180.0
@export_range(2.0, 10.0, 0.25) var cell_size: float = 3.0
@export_range(0.0, 20.0, 0.1) var maximum_depth: float = 13.0
@export_range(0.0, 10.0, 0.1) var lagoon_depth: float = 5.0
@export_range(0.0, 10.0, 0.1) var shelf_depth: float = 2.5
@export var seed_value: int = 2804
@export var regenerate: bool = false:
    set(value):
        if value:
            generate()
        regenerate = false

var broad_noise: FastNoiseLite
var detail_noise: FastNoiseLite
var channel_noise: FastNoiseLite

func _ready() -> void:
    generate()

func smooth01(t: float) -> float:
    t = clampf(t, 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)

func sample_depth(x: float, z: float) -> float:
    # Depth starts at 0 at shoreline and is negative beneath sea level.
    var distance_fraction: float = clampf(z / maxf(length, 0.001), 0.0, 1.0)
    var coastal_ramp: float = smooth01(distance_fraction / 0.32)
    var depth: float = lagoon_depth * coastal_ramp
    # Wide shelf in the middle distance, followed by a deeper outer channel.
    var shelf_center: float = 0.62 + broad_noise.get_noise_1d(x * 0.025) * 0.065
    var shelf: float = exp(-pow((distance_fraction - shelf_center) / 0.105, 2.0))
    depth -= shelf_depth * shelf
    var outer_drop: float = smooth01((distance_fraction - 0.75) / 0.25)
    depth += (maximum_depth - lagoon_depth) * outer_drop
    # Broad undulations and small sandbar ripples. Fade them at the beach.
    var variation_fade: float = smooth01(distance_fraction / 0.18)
    depth += broad_noise.get_noise_2d(x, z) * 0.90 * variation_fade
    depth += detail_noise.get_noise_2d(x, z) * 0.15 * variation_fade
    # Channel wandering laterally across the lagoon, with soft edges.
    var channel_center: float = sin(z * 0.027 + 0.8) * 23.0
    var channel_distance: float = abs(x - channel_center)
    var channel_mask: float = 1.0 - smooth01((channel_distance - 7.0) / 12.0)
    var channel_start: float = smooth01((distance_fraction - 0.22) / 0.20)
    depth += 1.35 * channel_mask * channel_start
    return clampf(depth, 0.0, maximum_depth + 1.5)

func generate() -> void:
    broad_noise = FastNoiseLite.new()
    broad_noise.seed = seed_value
    broad_noise.frequency = 0.018
    broad_noise.fractal_type = FastNoiseLite.FRACTAL_FBM
    broad_noise.fractal_octaves = 3
    detail_noise = FastNoiseLite.new()
    detail_noise.seed = seed_value + 101
    detail_noise.frequency = 0.14
    detail_noise.fractal_type = FastNoiseLite.FRACTAL_FBM
    detail_noise.fractal_octaves = 2
    channel_noise = FastNoiseLite.new()
    channel_noise.seed = seed_value + 202
    channel_noise.frequency = 0.02

    var nx: int = maxi(2, int(ceil(width / cell_size)))
    var nz: int = maxi(2, int(ceil(length / cell_size)))
    var vertices := PackedVector3Array()
    var uvs := PackedVector2Array()
    var indices := PackedInt32Array()
    for iz in range(nz + 1):
        var z: float = length * float(iz) / float(nz)
        for ix in range(nx + 1):
            var x: float = width * (float(ix) / float(nx) - 0.5)
            vertices.append(Vector3(x, -sample_depth(x, z), z))
            uvs.append(Vector2(float(ix) / nx, float(iz) / nz))
    for iz in range(nz):
        for ix in range(nx):
            var a: int = iz * (nx + 1) + ix
            var b: int = a + 1
            var c: int = a + nx + 1
            var d: int = c + 1
            # Winding faces up (toward +Y).
            indices.append_array(PackedInt32Array([a, c, b, b, c, d]))
    var arrays := []
    arrays.resize(Mesh.ARRAY_MAX)
    arrays[Mesh.ARRAY_VERTEX] = vertices
    arrays[Mesh.ARRAY_TEX_UV] = uvs
    arrays[Mesh.ARRAY_INDEX] = indices
    var generated := ArrayMesh.new()
    generated.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays)
    mesh = generated
    # Trimesh collision is appropriate for this static prototype, but can
    # be disabled if the game uses its own terrain collision.
    for child in get_children():
        if child.name == "GeneratedSeabedCollision":
            child.queue_free()
    var body := StaticBody3D.new()
    body.name = "GeneratedSeabedCollision"
    var shape := CollisionShape3D.new()
    shape.shape = generated.create_trimesh_shape()
    body.add_child(shape)
    add_child(body)
    body.owner = get_tree().edited_scene_root if Engine.is_editor_hint() else null
    shape.owner = body.owner
