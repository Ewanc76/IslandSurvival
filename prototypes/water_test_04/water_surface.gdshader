shader_type spatial;
render_mode blend_mix, depth_draw_always, cull_disabled, diffuse_burley, specular_schlick_ggx;

// Test 04: lightweight tropical water for Godot 4 Compatibility.
// Apply to a flat water mesh. Tune shallow/deep colors and depth thresholds.
uniform vec4 shallow_color : source_color = vec4(0.10, 0.70, 0.68, 0.68);
uniform vec4 deep_color : source_color = vec4(0.015, 0.16, 0.34, 0.90);
uniform vec4 foam_color : source_color = vec4(0.86, 0.96, 0.91, 1.0);
uniform float depth_fade_distance : hint_range(0.2, 20.0) = 5.0;
uniform float foam_width : hint_range(0.01, 2.0) = 0.42;
uniform float wave_height : hint_range(0.0, 0.5) = 0.055;
uniform float wave_scale : hint_range(0.1, 10.0) = 1.6;
uniform float wave_speed : hint_range(0.0, 3.0) = 0.45;
uniform sampler2D depth_texture : hint_depth_texture, repeat_disable, filter_nearest;

varying vec3 world_pos;

void vertex() {
    vec3 wp = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
    float a = sin(wp.x * wave_scale + TIME * wave_speed);
    float b = cos(wp.z * wave_scale * 0.83 - TIME * wave_speed * 0.75);
    VERTEX.y += (a + b) * wave_height * 0.5;
    world_pos = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
}

void fragment() {
    float scene_depth = texture(depth_texture, SCREEN_UV).r;
    vec3 floor_view = (INV_PROJECTION_MATRIX * vec4(SCREEN_UV * 2.0 - 1.0, scene_depth, 1.0)).xyz;
    vec3 surface_view = (INV_PROJECTION_MATRIX * vec4(SCREEN_UV * 2.0 - 1.0, FRAGCOORD.z, 1.0)).xyz;
    float floor_distance = -floor_view.z / max(abs(floor_view.z / floor_view.z), 0.0001);
    float surface_distance = -surface_view.z / max(abs(surface_view.z / surface_view.z), 0.0001);
    float water_depth = max(floor_distance - surface_distance, 0.0);
    float deep_factor = smoothstep(0.0, depth_fade_distance, water_depth);
    vec4 tint = mix(shallow_color, deep_color, deep_factor);
    float foam = 1.0 - smoothstep(0.0, foam_width, water_depth);
    float ripples = sin(world_pos.x * 7.0 + TIME * 1.4) * sin(world_pos.z * 5.5 - TIME * 1.2);
    foam *= 0.72 + 0.28 * ripples;
    ALBEDO = mix(tint.rgb, foam_color.rgb, clamp(foam, 0.0, 1.0) * 0.65);
    ALPHA = clamp(tint.a + foam * 0.16, 0.0, 1.0);
    ROUGHNESS = 0.18;
    SPECULAR = 0.7;
}
