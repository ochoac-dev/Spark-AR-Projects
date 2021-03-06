    #version 300 es

    #if defined(AE_FRAMEBUFFER_FETCH)
        #if defined(GL_EXT_shader_framebuffer_fetch)
            #extension GL_EXT_shader_framebuffer_fetch : require
        #elif defined(GL_ARM_shader_framebuffer_fetch)
            #extension GL_ARM_shader_framebuffer_fetch : require
        #endif
    #endif
    #define ae_insert_flip_uniform // FlipPatch will insert flip uniform here

    precision highp float;

    //diffuse options: Diffuse_Lambert Diffuse_Disney Diffuse_OrenNayar Diffuse_Gotanda
    //diffuse for main light
    #define DIFFUSE_HIGH Diffuse_OrenNayar
    //diffuse for other lights
    #define DIFFUSE_LOW Diffuse_Lambert

    //specular options: Specular_Blinn Specular_GGX_Low Specular_GGX
    //specular for main light
    #define SPECULAR_HIGH Specular_GGX
    //specular for other lights
    #define SPECULAR_LOW Specular_GGX_Low

    #define PARAMETERS_PASS envInt, envRot, albedo, opacity, cutoff, normal, clearCoatNormal, metallic, roughness, ao, subsurface, subsurfaceCol, subsurfaceColMultiply, ior, transmittance, transmittanceColorAtDistance, thin, clearCoat, clearCoatRoughness, emissive, anisotropic, anisotropicRotate, rampID, rim, rimCol, ambient, matcap, smoothFactor
    #define PARAMETERS_DEFINE float envInt, float envRot, vec3 albedo, float opacity, float cutoff, vec3 normal, vec3 clearCoatNormal, float metallic, float roughness, float ao, float subsurface, vec3 subsurfaceCol, vec3 subsurfaceColMultiply,float ior, float transmittance, float transmittanceColorAtDistance, float thin, float clearCoat, float clearCoatRoughness, vec3 emissive, float anisotropic, float anisotropicRotate, float rampID, float rim, vec3 rimCol, vec3 ambient, vec3 matcap, float smoothFactor
    #define VARIABLES_DEFINE float envInt; float envRot; vec3 albedo; float opacity; float cutoff; vec3 normal; vec3 clearCoatNormal; float metallic; float roughness; float ao; float subsurface; vec3 subsurfaceCol; vec3 subsurfaceColMultiply;float ior; float transmittance; float transmittanceColorAtDistance; float thin; float clearCoat; float clearCoatRoughness; vec3 emissive; float anisotropic; float anisotropicRotate; float rampID; float rim; vec3 rimCol; vec3 ambient; vec3 matcap; float smoothFactor;
  

    // --------------------- Const ---------------------
    const int   MAX_NUM_DIR     = 3;
    const int   MAX_NUM_POINT   = 2;
    const int   MAX_NUM_SPOT    = 2;
    const float M_PI            = 3.14159265;
    const float M_INV_PI        = 0.31830989;
    const float M_RAD           = 6.28318531;
    const float B_PBR_MIN_ROUGH = 0.08;
    const float B_PBR_MAX_ROUGH = 1.00;
    const float AE_MIP_LEVEL    = 7.0;
    // --------------------- Varying ---------------------
    in           vec3                  v_posWS;
    in           vec3                  v_nDirWS;
    in           vec2                  v_uv0;
    #ifdef Anisotropic
    in           vec2                  v_uvAniso;
    #endif
    in           vec3                  v_tDirWS;
    in           vec3                  v_bDirWS;
    #if defined(Parallax) || defined(DetailNormalParallax)
    in           vec3                  v_viewDirTS;
    #endif
    #ifdef       Refraction
    in           vec2                  v_pixelSize;
    #endif
    #ifdef GL_EXT_shader_framebuffer_fetch
       inout        vec4 glResult;
    #else
       out          vec4 glResult;
    #endif
    //           --------------------- Uniform                                    ---------------------
    //           ---                   Material                                   ---
    //uniform    sampler2D             u_DGFLutTex;
    #ifdef       AlbedoTex
    uniform      sampler2D             u_AlbedoTex;
    uniform      float                 u_Cutoff;
    #endif
    uniform      vec4                  u_AlbedoCol;
    #ifdef       NormalTexture
    uniform      sampler2D             u_NormalTexture;
    //normal     intensity
    uniform      float                 u_NormInt;
    #endif
    #ifdef       MRATex
    //r:metallic g:roughness           b:ao
    uniform      sampler2D             u_MRATex;
    #endif
    uniform      float                 u_Metallic;
    uniform      float                 u_Roughness;
    uniform      float                 u_Occlusion;
    uniform      float                 u_Thin;

    uniform      sampler2D             u_EnvTex;
    uniform      float                 u_EnvInt;
    uniform      float                 u_EnvRot;
    #ifdef       Anisotropic
    //aniso      r:rotate g:intensity
    uniform      sampler2D             u_AnisotropicRotateIntensityTex;
    uniform      float                 u_AnisotropicTilingU;
    uniform      float                 u_AnisotropicTilingV;
    uniform      float                 u_AnisotropicRotate;
    uniform      float                 u_AnisotropicInt;
    #endif
    
    #ifdef       Subsurface
    uniform      float                 u_Subsurface;
    uniform      vec4                  u_SubsurfaceCol;
    uniform      sampler2D             u_SubsurfaceAlbedoBlurTex;
    #endif

    //r:thin(0.0 is thick, 1.0is thin) b:Height
    uniform      sampler2D             u_ThinHeightTex;
    
    #ifdef       Parallax
    uniform      float                 u_ParallaxInt;
    uniform      float                 u_HeightOffset;
    #endif
    #ifdef       Emissive
    uniform      float                 u_EmissiveInt;
    uniform      sampler2D             u_EmissiveTex;
    uniform      vec4                  u_EmissiveCol;
    #endif

    #ifdef       ClearCoat
    uniform      float                 u_ClearCoatInt;
    uniform      float                 u_ClearCoatRoughness;
    #endif

    #ifdef       Refraction
    uniform      float                 u_IOR;
    uniform      float                 u_Transmittance;
    uniform      float                 u_TransmittanceColorAtDistance;
    #endif

    #ifdef       DetailNormal
    uniform      sampler2D             u_DetailNormalTex;
    uniform      float                 u_DetailNormalInt;
    uniform      float                 u_DetailNormalTilingU;
    uniform      float                 u_DetailNormalTilingV;
    #endif

    #ifdef       DetailNormalParallax
    uniform      sampler2D             u_DetailNormalColorTex;
    uniform      float                 u_DetailNormalParallaxDepth;
    uniform      float                 u_DetailNormalParallaxMetalic;
    uniform      float                 u_DetailNormalParallaxRoughness;
    #endif

  
    //           ---                   System                                     ---
    uniform      mat4                  u_VP;
    uniform      vec3                  u_WorldSpaceCameraPos;
    uniform      vec4                  u_Time;
    //           DirLight
    uniform      float                 u_DirLightNum;
    uniform      float                 u_DirLightsEnabled[MAX_NUM_DIR];
    uniform      vec3                  u_DirLightsDirection[MAX_NUM_DIR];
    uniform      vec3                  u_DirLightsColor[MAX_NUM_DIR];
    uniform      float                 u_DirLightsIntensity[MAX_NUM_DIR];
    //           PointLight
    uniform      float                 u_PointLightNum;
    uniform      float                 u_PointLightsEnabled[MAX_NUM_POINT];
    uniform      vec3                  u_PointLightsPosition[MAX_NUM_POINT];
    uniform      vec3                  u_PointLightsColor[MAX_NUM_POINT];
    uniform      float                 u_PointLightsIntensity[MAX_NUM_POINT];
    uniform      float                 u_PointLightsAttenRangeInv[MAX_NUM_POINT];
    //           SpotLight
    uniform      float                 u_SpotLightNum;
    uniform      float                 u_SpotLightsEnabled[MAX_NUM_SPOT];
    uniform      vec3                  u_SpotLightsDirection[MAX_NUM_SPOT];
    uniform      vec3                  u_SpotLightsPosition[MAX_NUM_SPOT];
    uniform      vec3                  u_SpotLightsColor[MAX_NUM_SPOT];
    uniform      float                 u_SpotLightsIntensity[MAX_NUM_SPOT];
    uniform      float                 u_SpotLightsInnerAngleCos[MAX_NUM_SPOT];
    uniform      float                 u_SpotLightsOuterAngleCos[MAX_NUM_SPOT];
    uniform      float                 u_SpotLightsAttenRangeInv[MAX_NUM_SPOT];

    // --------------------- Struct ---------------------
    struct VSOutput
    {
        vec3        posWS;
        vec3        nDirWS; //normal
        vec3        tDirWS; //tangent
        vec3        bDirWS; //binormal
    };
    struct SurfaceParams
    {
        vec3        albedo;
        float       opacity;
        float       cutoff;
        vec3        emissive;
        vec2        metalParams;            //X:Metallic    Y:1-Metallic
        vec3        roughParams;            //X:PerceptualRoughness Y:roughness Z:roughness*roughness
        vec3        clearCoatRoughParams;   //X:PerceptualRoughness Y:roughness Z:roughness*roughness
        vec2        occParams;              //X:DiffuseOcclusion Y:SpecOcclusion
        vec3        diffCol;
        vec3        specCol;
        vec2        anisoParams;            //X:AnisotropicAngle  Y:AnisotropicInt
        float       thin;

        float       subsurface;
        vec3        subsurfaceColMultiply;
        vec3        subsurfaceCol;

        float       ior;
        float       transmittance;
        float       transmittanceColorAtDistance;

        float       clearCoat;

        //WorldSpaceVectors
        vec3        pos;
        vec3        nDir;                   //world space normal from texture
        vec3        vnDir;                  //world space normal from vertex
        vec3        cnDir;                  //clear coat normal from texture
        vec3        tDir;                   //tangent
        vec3        bDir;                   //binormal
        vec3        vDir;                   //view dir
        vec3        rDir;                   //reflect dir
        vec3        crDir;                  //clear coat reflect dir
    };
  
    struct EnvironmentParams
    {
        float       intensity;
        float       rotation;
    };
    struct LightParams
    {
        vec3        lDir;
        vec3        color;
        float       intensity;
        vec3        attenuate;
    };
   
    // --------------------- Frame buffer fetch ---------------------

    uniform sampler2D u_FBOTexture;
    vec4 TextureFromFBO(vec2 uv)
    {
        #if defined(AE_FRAMEBUFFER_FETCH)
            #if defined(GL_EXT_shader_framebuffer_fetch)
                vec4 result = glResult.rgba;
            #elif defined(GL_ARM_shader_framebuffer_fetch)
                vec4 result = gl_LastFragColorARM;
            #else
                #error AE_FRAMEBUFFER_FETCH but no ext found!
            #endif
        #else
             vec4 result = texture(u_FBOTexture, uv);
        #endif
        return result;
    }

    #ifdef AMAZING_USE_BLENDMODE_MUTIPLAY
    vec3 BlendMultiply(vec3 base, vec3 blend)
    {
            return base * blend;
    }
    vec3 BlendMultiply(vec3 base, vec3 blend, float opacity)
    {
            return (BlendMultiply(base, blend) * opacity + base * (1.0 - opacity));
    }
    #endif

    #ifdef AMAZING_USE_BLENDMODE_OVERLAY
    float BlendOverlay(float base, float blend)
    {
            return base < 0.5 ? (2.0 * base * blend) :(1.0 - 2.0 * (1.0 - base) * (1.0 - blend));
    }
    vec3 BlendOverlay(vec3 base, vec3 blend)
    {
            return vec3(BlendOverlay(base.r, blend.r), BlendOverlay(base.g, blend.g), BlendOverlay(base.b, blend.b));
    }
    vec3 BlendOverlay(vec3 base, vec3 blend, float opacity)
    {
            return (BlendOverlay(base, blend) * opacity + base * (1.0 - opacity));
    }
    #endif

    #ifdef AMAZING_USE_BLENDMODE_ADD
    vec3 BlendAdd(vec3 base, vec3 blend)
    {
        return min(base + blend,vec3(1.0));
    }
    vec3 BlendAdd(vec3 base, vec3 blend, float opacity)
    {
        return (BlendAdd(base, blend) * opacity + base * (1.0 - opacity));
    }
    #endif

    #ifdef AMAZING_USE_BLENDMODE_SCREEN
    vec3 BlendScreen(vec3 base, vec3 blend)
    {
        return vec3(1.0) - ((vec3(1.0) - base) * (vec3(1.0) - blend));
    }
    vec3 BlendScreen(vec3 base, vec3 blend, float opacity)
    {
        return (BlendScreen(base, blend) * opacity + base * (1.0 - opacity));
    }
    #endif

    #ifdef AMAZING_USE_BLENDMODE_SOFTLIGHT
    float BlendSoftLight(float base, float blend)
    {
        return (blend<0.5)?(2.0*base*blend+base*base*(1.0-2.0*blend)):(sqrt(base)*(2.0*blend-1.0)+2.0*base*(1.0-blend));
    }
    vec3 BlendSoftLight(vec3 base, vec3 blend)
    {
        return vec3(BlendSoftLight(base.r,blend.r),BlendSoftLight(base.g,blend.g),BlendSoftLight(base.b,blend.b));
    }
    vec3 BlendSoftLight(vec3 base, vec3 blend, float opacity)
    {
        return (BlendSoftLight(base, blend) * opacity + base * (1.0 - opacity));
    }
    #endif

    #ifdef AMAZING_USE_BLENDMODE_AVERAGE
    vec3 BlendAverage(vec3 base, vec3 blend)
    {
            return (base + blend) / 2.0;
    }
    vec3 BlendAverage(vec3 base, vec3 blend, float opacity)
    {
            return (BlendAverage(base, blend) * opacity + base * (1.0 - opacity));
    }
    #endif

    #ifdef AMAZING_USE_BLENDMODE_COLORBURN
    float BlendColorBurn(float base, float blend)
    {
            return (blend == 0.0) ? blend : max((1.0 - ((1.0 - base) / blend)),0.0);
    }
    vec3 BlendColorBurn(vec3 base, vec3 blend)
    {
            return vec3(BlendColorBurn(base.r, blend.r), BlendColorBurn(base.g, blend.g), BlendColorBurn(base.b, blend.b));
    }
    vec3 BlendColorBurn(vec3 base, vec3 blend, float opacity)
    {
            return (BlendColorBurn(base, blend) * opacity + base * (1.0 - opacity));
    }
    #endif

    #ifdef AMAZING_USE_BLENDMODE_COLORDODGE
    float BlendColorDodge(float base, float blend)
    {
            return (blend == 1.0) ? blend : min(base / (1.0 - blend), 1.0);
    }
    vec3 BlendColorDodge(vec3 base, vec3 blend)
    {
            return vec3(BlendColorDodge(base.r, blend.r), BlendColorDodge(base.g, blend.g), BlendColorDodge(base.b, blend.b));
    }
    vec3 BlendColorDodge(vec3 base, vec3 blend, float opacity)
    {
            return (BlendColorDodge(base, blend) * opacity + base * (1.0 - opacity));
    }
    #endif

    #ifdef AMAZING_USE_BLENDMODE_DARKEN
    float BlendDarken(float base, float blend)
    {
            return min(blend,base);
    }
    vec3 BlendDarken(vec3 base, vec3 blend)
    {
            return vec3(BlendDarken(base.r,blend.r), BlendDarken(base.g,blend.g), BlendDarken(base.b,blend.b));
    }
    vec3 BlendDarken(vec3 base, vec3 blend, float opacity)
    {
            return (BlendDarken(base, blend) * opacity + base * (1.0 - opacity));
    }
    #endif

    #ifdef AMAZING_USE_BLENDMODE_DIFFERENCE
    vec3 BlendDifference(vec3 base, vec3 blend)
    {
            return abs(base - blend);
    }
    vec3 BlendDifference(vec3 base, vec3 blend, float opacity)
    {
            return (BlendDifference(base, blend) * opacity + base * (1.0 - opacity));
    }
    #endif

    #ifdef AMAZING_USE_BLENDMODE_EXCLUSION
    vec3 BlendExclusion(vec3 base, vec3 blend)
    {
            return base + blend - 2.0 * base * blend;
    }
    vec3 BlendExclusion(vec3 base, vec3 blend, float opacity)
    {
            return (BlendExclusion(base, blend) * opacity + base * (1.0 - opacity));
    }
    #endif

    #ifdef AMAZING_USE_BLENDMODE_LIGHTEN
    float BlendLighten(float base, float blend)
    {
            return max(blend,base);
    }
    vec3 BlendLighten(vec3 base, vec3 blend)
    {
            return vec3(BlendLighten(base.r,blend.r), BlendLighten(base.g,blend.g), BlendLighten(base.b,blend.b));
    }
    vec3 BlendLighten(vec3 base, vec3 blend, float opacity)
    {
            return (BlendLighten(base, blend) * opacity + base * (1.0 - opacity));
    }
    #endif

    #ifdef AMAZING_USE_BLENDMODE_LINEARDODGE
    float BlendLinearDodge(float base, float blend)
    {
            return min(base + blend, 1.0);
    }
    vec3 BlendLinearDodge(vec3 base, vec3 blend)
    {
            return min(base + blend,vec3(1.0));
    }
    vec3 BlendLinearDodge(vec3 base, vec3 blend, float opacity)
    {
            return (BlendLinearDodge(base, blend) * opacity + base * (1.0 - opacity));
    }
    #endif

    vec4 ApplyBlendMode(vec4 color, vec2 uv)
    {
        vec4 ret = color;
    #ifdef AMAZING_USE_BLENDMODE_MUTIPLAY
        vec4 framecolor = TextureFromFBO(uv);
        ret.rgb = BlendMultiply(ret.rgb, framecolor.rgb, ret.a);
    #endif

    #ifdef AMAZING_USE_BLENDMODE_OVERLAY
        vec4 framecolor = TextureFromFBO(uv);
        ret.rgb = BlendOverlay(ret.rgb, framecolor.rgb, ret.a);
    #endif

    #ifdef AMAZING_USE_BLENDMODE_ADD
        vec4 framecolor = TextureFromFBO(uv);
        ret.rgb = BlendAdd(ret.rgb, framecolor.rgb, ret.a);
    #endif

    #ifdef AMAZING_USE_BLENDMODE_SCREEN
        vec4 framecolor = TextureFromFBO(uv);
        ret.rgb = BlendScreen(ret.rgb, framecolor.rgb, ret.a);
    #endif

    #ifdef AMAZING_USE_BLENDMODE_SOFTLIGHT
        vec4 framecolor = TextureFromFBO(uv);
        ret.rgb = BlendSoftLight(ret.rgb, framecolor.rgb, ret.a);
    #endif

    #ifdef AMAZING_USE_BLENDMODE_AVERAGE
        vec4 framecolor = TextureFromFBO(uv);
        ret.rgb = BlendAverage(ret.rgb, framecolor.rgb, ret.a);
    #endif

    #ifdef AMAZING_USE_BLENDMODE_COLORBURN
        vec4 framecolor = TextureFromFBO(uv);
        ret.rgb = BlendColorBurn(ret.rgb, framecolor.rgb, ret.a);
    #endif

    #ifdef AMAZING_USE_BLENDMODE_COLORDODGE
        vec4 framecolor = TextureFromFBO(uv);
        ret.rgb = BlendColorDodge(ret.rgb, framecolor.rgb, ret.a);
    #endif

    #ifdef AMAZING_USE_BLENDMODE_DARKEN
        vec4 framecolor = TextureFromFBO(uv);
        ret.rgb = BlendDarken(ret.rgb, framecolor.rgb, ret.a);
    #endif

    #ifdef AMAZING_USE_BLENDMODE_DIFFERENCE
        vec4 framecolor = TextureFromFBO(uv);
        ret.rgb = BlendDifference(ret.rgb, framecolor.rgb, ret.a);
    #endif

    #ifdef AMAZING_USE_BLENDMODE_EXCLUSION
        vec4 framecolor = TextureFromFBO(uv);
        ret.rgb = BlendExclusion(ret.rgb, framecolor.rgb, ret.a);
    #endif

    #ifdef AMAZING_USE_BLENDMODE_LIGHTEN
        vec4 framecolor = TextureFromFBO(uv);
        ret.rgb = BlendLighten(ret.rgb, framecolor.rgb, ret.a);
    #endif

    #ifdef AMAZING_USE_BLENDMODE_LINEARDODGE
        vec4 framecolor = TextureFromFBO(uv);
        ret.rgb = BlendLinearDodge(ret.rgb, framecolor.rgb, ret.a);
    #endif
        return ret;
    }
    // --------------------- Common ---------------------
    vec3 InverseNormalY(vec3 normal)
    {
        normal.y = 1.0 - normal.y;
        return normal;
    }

    vec3 NormalIntensity(vec3 normalTS, float normalIntensity)
    {
        normalTS = mix(vec3(0.5, 0.5, 1.0), normalTS, normalIntensity);
        return normalTS;
    }

    vec3 DecodeNormal(vec3 normalTS, float normalIntensity)
    {
        #ifndef DoNotInverseNormalY
            //inverse normal.y defaultly
            normalTS = InverseNormalY(normalTS);
        #endif

        normalTS = NormalIntensity(normalTS, normalIntensity);
        normalTS = normalize(normalTS * 2.0 - 1.0);

        return normalTS;
    }

    vec3 BlendNormal(vec3 n1, vec3 n2)
    {
        n1 += vec3(0, 0, 1);
        n2 *= vec3(-1, -1, 1);
        
        return n1*dot(n1, n2)/n1.z - n2;
    }

    //Grain Normal
    vec3 ComputeGrainNormal(vec3 grainDir, vec3 V)
    {
        vec3 B = cross(-V, grainDir);
        return cross(B, grainDir);
    }
    
    vec3 GetAnisotropicModifiedNormal(vec3 grainDir, vec3 N, vec3 V, float anisotropy)
    {
        vec3 grainNormal = ComputeGrainNormal(grainDir, V);
        // TODO: test whether normalizing 'grainNormal' is worth it.
        return normalize(mix(N, grainNormal, anisotropy));
    }


    float saturate(float x)
    {
        return clamp(x, 0.0, 1.0);
    }

    vec3 saturate(vec3 v)
    {
        v.x = clamp(v.x, 0.0, 1.0);
        v.y = clamp(v.y, 0.0, 1.0);
        v.z = clamp(v.z, 0.0, 1.0);
        return v;
    }

    vec3 Clamp(vec3 v, float left, float right)
    {
        v.x = clamp(v.x, left, right);
        v.y = clamp(v.y, left, right);
        v.z = clamp(v.z, left, right);
        return v;
    }

 
    float Pow2 (float x)
    {
        return x * x;
    }
    float Pow4 (float x)
    {
        float x2 = x * x;
        return x2 * x2;
    }
    float Pow5 (float x)
    {
        float x2 = x * x;
        return x2 * x2 * x;
    }
    float Atan2(float x, float y)
    {
        float signx = x < 0.0 ? -1.0 : 1.0;
        return signx * acos(clamp(y / length(vec2(x, y)), -1.0, 1.0));
    }
    vec3 GammaToLinear(vec3 col)
    {
        return vec3(
            pow(col.r, 2.2),
            pow(col.g, 2.2),
            pow(col.b, 2.2)
        );
    }
    vec3 LinearToGamma(vec3 col)
    {
        return vec3(
            pow(col.r, 0.454545),
            pow(col.g, 0.454545),
            pow(col.b, 0.454545)
        );
    }
    vec3 LinearToneMapping(vec3 x)
    {
        float a = 1.8;  // Mid
        float b = 1.4;  // Toe
        float c = 0.5;  // Shoulder
        float d = 1.5;  // Mid
        return (x * (a * x + b)) / min(vec3(1000.0), (x * (a * x + c) + d));
    }

    float ParamMapingScaleDark(float val, float scale)
    {
        return mix(1.0, val, scale);
    }

    float ParamMapingOffset(float val, float offset)
    {
        return val + offset - 0.5;
    }

    float ParamMapingScale(float val, float scale)
    {
        return val * scale;
    }

    #ifdef Parallax
    // Calculates UV offset for parallax bump mapping
    // https://learnopengl.com/Advanced-Lighting/Parallax-Mapping
    vec2 ParallaxOffset(float parallax)
    {
        vec3 vDir            = normalize(u_WorldSpaceCameraPos - v_posWS);
       
        vec2 texCoordOffsets = clamp(parallax * v_viewDirTS.xy / v_viewDirTS.z, -0.05, 0.05); 
        
        //uv.y always is inverse
        texCoordOffsets.y = -texCoordOffsets.y;
        return texCoordOffsets;
    }
    #endif

    // ---------------------- Shadow ----------------------
    //           Shadow
    #ifdef Shadow
        #ifdef AE_DirLightNum
            #if AE_DirLightNum > 0
                uniform sampler2D u_DirLight0ShadowTexture;
                uniform float u_DirLight0ShadowBias;
                uniform mat4 u_DirLight0ShadowMatrix;
                uniform vec2 u_DirLight0ShadowTextureSize;
                uniform float u_DirLight0ShadowStrength;
                uniform float u_DirLight0ShadowSoftness;
                uniform float u_DirLight0ShadowSoft;
                uniform vec3 u_DirLight0ShadowColor;
                uniform vec2 u_DirLight0ShadowBoundingBoxSize;
                uniform float u_DirLight0SelfShadowGradient;

                #define SELFSHADOW_COS_MAX 0.00872653549837393496488821397358
                #define PI 3.14159
                #define SAMPLE_BOX_SIZE 4

                float DecodeFloat(const vec4 value)
                {
                    const vec4 bitSh = vec4(1.0/(256.0*256.0), 1.0/(256.0), 1.0, 0.0);
                    return(dot(value, bitSh));
                }

                float rand(vec2 co)
                {
                    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
                }

                vec4 Shadowing(SurfaceParams S, LightParams L)
                {
                    const int sample_size = SAMPLE_BOX_SIZE * SAMPLE_BOX_SIZE;
                    float nl = max(dot(S.nDir, L.lDir), 0.0);
                    vec4 proj_pos = u_DirLight0ShadowMatrix * vec4(S.pos, 1.0);
                    vec3 shadow_coord = proj_pos.xyz / proj_pos.w;
                    if(shadow_coord.x < 0.0 || shadow_coord.y < 0.0 || shadow_coord.x > 1.0 || shadow_coord.y > 1.0)
                        return vec4(u_DirLight0ShadowColor, 1.0);

                    shadow_coord.z = clamp(shadow_coord.z, 0.0, 1.0);
                    float bias = u_DirLight0ShadowBias + clamp(tan(acos(nl)) / 1000.0, 0.0, 0.001);
                    bias = clamp(bias, 0.0, 1.0);

                    float shadow_factor = 0.0;
                    float shadow_sum = 0.0;
                    float shadow_alpha = 0.0;
                    vec2 inv_tex_size = vec2(1.0) / u_DirLight0ShadowTextureSize;
                    float inv_num = 1.0 / float(SAMPLE_BOX_SIZE * SAMPLE_BOX_SIZE);
                    if (u_DirLight0ShadowSoft > 0.0) {
                      for (int i = 0; i < SAMPLE_BOX_SIZE; i++) {
                        float float_i = float(i);
                        for (int j = 0; j < SAMPLE_BOX_SIZE; j++) {
                          float float_j = float(j);
                          float jitter_x = rand(shadow_coord.xy + vec2(float_i, float_j));
                          float jitter_y = rand(shadow_coord.xy + vec2(float_i * 2.0, float_j * 3.0));
                          float r = sqrt(float_i + jitter_x);
                          float theta = 2.0 * PI * (float(j) + jitter_y) * inv_num;

                          vec4 data = texture(u_DirLight0ShadowTexture, shadow_coord.xy + vec2(r * cos(theta), r * sin(theta)) * u_DirLight0ShadowSoftness * inv_tex_size);
                          float depth = DecodeFloat(data);
                          float noShadow = float(shadow_coord.z <= depth + bias);
                          shadow_sum += noShadow;
                          shadow_alpha += max(data.a, noShadow);
                        }
                      }
                      shadow_factor = shadow_sum / float(sample_size);
                      shadow_alpha /= float(sample_size);
                    } else {
                      vec4 data = texture(u_DirLight0ShadowTexture, shadow_coord.xy);
                      float depth = DecodeFloat(data);
                      float noShadow = float(shadow_coord.z <= depth + bias);
                      shadow_factor = noShadow;
                      shadow_alpha = max(data.a, noShadow);
                    }

                    if(u_DirLight0SelfShadowGradient > 0.0001) {
                        shadow_factor = min(clamp((nl - SELFSHADOW_COS_MAX) * u_DirLight0SelfShadowGradient, 0.0, 1.0), shadow_factor);
                    }

                    if (shadow_factor < 1.0) {
                      shadow_factor = mix(1.0, shadow_factor, u_DirLight0ShadowStrength * shadow_alpha);
                    }

                    return vec4(u_DirLight0ShadowColor, shadow_factor);
                }
            #endif
        #endif
    #endif
    // ----------------------- Direct Lighting -----------------------
    // perceptualRoughness = perceptually roughness = S.roughParams.x;
    // a = perceptualRoughness^2 = S.roughParams.y;
    // a2 = a^2 = S.roughParams.z;

    //just like Unity, diffuse is multiple by PI to make incident normal on object are same color of light color, so specular need to multiple by PI too.
    // ------ Diffuse ------
    vec3 Diffuse_Lambert(SurfaceParams S, LightParams L) 
    {
        float ndl = max(0.0, dot(S.nDir, L.lDir));
        float lighting = ndl;
        return S.diffCol * L.color * L.intensity * L.attenuate * lighting;
    }
    //https://blog.selfshadow.com/publications/s2012-shading-course/burley/s2012_pbs_disney_brdf_slides_v2.pdf
    vec3 Diffuse_Disney(SurfaceParams S, LightParams L)
    {
        vec3 hDir = normalize(L.lDir + S.vDir);
        float ldh = max(0.0, dot(L.lDir, hDir));
        float ndl = max(0.0, dot(S.nDir, L.lDir));
        float ndv = max(0.0, dot(S.nDir, S.vDir));

        float perceptualRoughness = S.roughParams.x;
        float fd90 = 0.5 + 2.0 * ldh * ldh * perceptualRoughness; //ldh = vdh 
        float lightScatter = (1.0 + (fd90 - 1.0) * Pow5(1.0 - ndl));
        float viewScatter = (1.0 + (fd90 - 1.0) * Pow5(1.0 - ndv));
        float lighting = lightScatter * viewScatter * ndl;

        return S.diffCol * L.color * L.intensity * L.attenuate * lighting;
    }
    // [Gotanda 2012, "Beyond a Simple Physically Based Blinn-Phong Model in Real-Time"]
    vec3 Diffuse_OrenNayar(SurfaceParams S, LightParams L)
    {
        vec3 hDir = normalize(L.lDir + S.vDir);
        float ndl = max(0.0, dot(S.nDir, L.lDir));
        float ndv = max(0.0, dot(S.nDir, S.vDir));
        float vdh = max(0.0, dot(S.vDir, hDir));

        float a = S.roughParams.y;
        float s = a;// / ( 1.29 + 0.5 * a );
        float s2 = s * s;
        float VoL = 2.0 * vdh * vdh - 1.0;      // double angle identity
        float Cosri = VoL - ndv * ndl;
        float C1 = 1.0 - 0.5 * s2 / (s2 + 0.33);
        float C2 = 0.45 * s2 / (s2 + 0.09) * Cosri * ( Cosri >= 0.0 ? 1.0/( max( ndl, ndv ) ) : 1.0 );
        float lighting = ( C1 + C2 ) * ( 1.0 + S.roughParams.x * 0.5 ) * ndl;

        return S.diffCol * L.color * L.intensity * L.attenuate * lighting;
    }
    // [Gotanda 2014, "Designing Reflectance Models for New Consoles"]
    vec3 Diffuse_Gotanda(SurfaceParams S, LightParams L)
    {
        vec3 hDir = normalize(L.lDir + S.vDir); 
        float ndl = max(0.0, dot(S.nDir, L.lDir));
        float ndv = max(0.0, dot(S.nDir, S.vDir));
        float vdh = max(0.0, dot(S.vDir, hDir));

        float a = S.roughParams.y;
        float a2 = a * a;
        float F0 = 0.04;
        float VoL = 2.0 * vdh * vdh - 1.0;      // double angle identity
        float Cosri = VoL - ndv * ndl;
        
        float a2_13 = a2 + 1.36053;
        float Fr = ( 1.0 - ( 0.542026*a2 + 0.303573*a ) / a2_13 ) * ( 1.0 - pow( 1.0 - ndv, 5.0 - 4.0*a2 ) / a2_13 ) * ( ( -0.733996*a2*a + 1.50912*a2 - 1.16402*a ) * pow( 1.0 - ndv, 1.0 + 1.0/(39.0*a2*a2+1.0) ) + 1.0 );
        //float Fr = ( 1 - 0.36 * a ) * ( 1 - pow( 1 - ndv, 5 - 4*a2 ) / a2_13 ) * ( -2.5 * Roughness * ( 1 - ndv ) + 1 );
        float Lm = ( max( 1.0 - 2.0*a, 0.0 ) * ( 1.0 - Pow5( 1.0 - ndl ) ) + min( 2.0*a, 1.0 ) ) * ( 1.0 - 0.5*a * (ndl - 1.0) ) * ndl;
        float Vd = ( a2 / ( (a2 + 0.09) * (1.31072 + 0.995584 * ndv) ) ) * ( 1.0 - pow( 1.0 - ndl, ( 1.0 - 0.3726732 * ndv * ndv ) / ( 0.188566 + 0.38841 * ndv ) ) );
        float Bp = Cosri < 0.0 ? 1.4 * ndv * ndl * Cosri : Cosri;
        float lighting = (21.0 / 20.0) * (1.0 - F0) * ( Fr * Lm + Vd + Bp ) * ndl;

        return S.diffCol * L.color * L.intensity * L.attenuate * lighting;
    }
    #ifdef Subsurface
    vec3 SubsurfaceTerm(SurfaceParams S, LightParams L)
    {
        //forwardScatter base on https://colinbarrebrisebois.com/2011/03/07/gdc-2011-approximating-translucency-for-a-fast-cheap-and-convincing-subsurface-scattering-look/
        float transmittanceDistortion = 0.2;
        vec3 vLight = L.lDir + S.nDir * transmittanceDistortion;
        float vdl = max(0.0, dot(S.vDir, -vLight));
        float transmittancePower = 5.0;
        vec3 forwardScatter = pow(vdl, transmittancePower) * S.thin * S.subsurfaceCol; //Transmittance

        
        //backScatter base on http://blog.stevemcauley.com/2011/12/03/energy-conserving-wrapped-diffuse/
        vec3 normal = mix(S.nDir, S.vnDir, S.subsurface);
        float ndl = dot(normal, L.lDir);
        vec3 one = vec3(1.0, 1.0, 1.0);
        vec3 onePlusW = one + S.subsurfaceCol;
        vec3 ndlPlusW = vec3(ndl, ndl, ndl) + S.subsurfaceCol;
        float warpPower = 2.0;
        vec3 warpPowered = pow(saturate(ndlPlusW / onePlusW), vec3(warpPower, warpPower, warpPower));
        vec3 divider = 2.0 * onePlusW / (1.0 + warpPower);
        vec3 warp = warpPowered / divider;

        vec3 backScatter = saturate(warp) * S.subsurfaceColMultiply;

        vec3 lighting = forwardScatter + backScatter;
        vec3 subsurfaceTerm = L.color * L.intensity * L.attenuate * lighting;
        vec3 lambertTerm = Diffuse_Lambert(S, L);

        return mix(lambertTerm, subsurfaceTerm, S.subsurface);
    }
    #endif

    #ifdef Emissive
    vec3 EmissiveTerm(SurfaceParams S)
    {
        return S.emissive;
    }
    #endif 
    // ------ Specluar ------
    float D_Blinn(float ndh, float a2)
    {
        float n = 2.0 / a2 - 2.0;
        return (n + 2.0) / (2.0 * M_PI) * pow(ndh, n);
    }
    float D_GGX(float ndh, float a2)
    {
        float d = (ndh * a2 - ndh) * ndh + 1.0;
        return a2 * M_INV_PI / (d * d + 1e-7);
    }
    float V_Const()
    {
        return 0.25;
    }
    //Heitz 2014, ???Understanding the Masking-Shadowing Function in Microfacet-Based BRDFs???
    float V_SmithJointApprox(float a, float ndv, float ndl)
    {
        float lambdaV = ndl * (ndv * (1.0 - a) + a);
        float lambdaL = ndv * (ndl * (1.0 - a) + a);
        return 0.5 / (lambdaV + lambdaL + 1e-5);
    }
    vec3 F_None(vec3 specCol)
    {
        return specCol;
    }
    //Schlick, C. (1994).  "An Inexpensive BRDF Model for Physically-based Rendering"
    vec3 F_Schlick(vec3 f0, float vdh)
    {
        float t = Pow5(1.0 - vdh);
        return f0 + (1.0 - f0) * t;
    }



    #ifdef ClearCoat
        vec3 Specular_GGX_Low_Coat(SurfaceParams S, LightParams L, out float coatAttenuate)
        {
            vec3 hDir = normalize(L.lDir + S.vDir);
            float ndh = max(0.0, dot(S.cnDir, hDir));
            float vdh = max(0.0, dot(S.vDir, hDir));
            float ndl = max(0.0, dot(S.cnDir, L.lDir));

            float a = S.clearCoatRoughParams.y;
            float a2 = S.clearCoatRoughParams.z;
            float V = V_Const();
            float D = D_GGX(ndh, a2);
            vec3 specCol = vec3(0.04, 0.04, 0.04);
            vec3 F = F_Schlick(specCol, vdh); //vdh = ldh 
            coatAttenuate = 1.0 - F.r * S.clearCoat;

            return F * V * D * M_PI * ndl * L.color * L.intensity * L.attenuate * S.clearCoat;
        }
    #endif

    vec3 Specular_Blinn(SurfaceParams S, LightParams L) 
    {
        vec3 hDir = normalize(L.lDir + S.vDir);
        float ndh = max(0.0, dot(S.nDir, hDir));
        float ndl = max(0.0, dot(S.nDir, L.lDir));

        float a2 = S.roughParams.z;
        float V = V_Const();
        float D = D_Blinn(ndh, a2);
        vec3 F = F_None(S.specCol);
        vec3 specular = F * V * D * M_PI * ndl * L.color * L.intensity * L.attenuate;

        return specular;
 
    }
    vec3 Specular_GGX_Low(SurfaceParams S, LightParams L)
    {
        vec3 hDir = normalize(L.lDir + S.vDir);
        float ndh = max(0.0, dot(S.nDir, hDir));
        float vdh = max(0.0, dot(S.vDir, hDir));
        float ndl = max(0.0, dot(S.nDir, L.lDir));

        float a = S.roughParams.y;
        float a2 = S.roughParams.z;
        float V = V_Const();
        float D = D_GGX(ndh, a2);
        vec3 F = F_Schlick(S.specCol, vdh); //vdh = ldh
        vec3 specular = F * V * D * M_PI * ndl * L.color * L.intensity * L.attenuate;
        return specular;
    }
    vec3 Specular_GGX(SurfaceParams S, LightParams L)
    {
        vec3 hDir = normalize(L.lDir + S.vDir);
        float ndh = max(0.0, dot(S.nDir, hDir));
        float vdh = max(0.0, dot(S.vDir, hDir));
        float ndl = max(0.0, dot(S.nDir, L.lDir));
        float ndv = max(0.0, dot(S.nDir, S.vDir));

        float a = S.roughParams.y;
        float a2 = S.roughParams.z;
        float V = V_SmithJointApprox(ndl, ndv, a);
        float D = D_GGX(ndh, a2);
        vec3 F = F_Schlick(S.specCol, vdh); //vdh = ldh
        vec3 specular = F * V * D * M_PI * ndl * L.color * L.intensity * L.attenuate;
        return specular;
    }

    // ----------------------- Indirect Lighting -----------------------


     // ------ AO ------
    //https://google.github.io/filament/Filament.md.html#materialsystem/clearcoatmodel 
    float SpecularAO(SurfaceParams S)
    {
        float ndv = max(0.0, dot(S.nDir, S.vDir));
        float visibility = S.occParams.x;
        float perceptualRoughness = S.roughParams.x;
        // Lagarde and de Rousiers 2014, "Moving Frostbite to PBR"
        float lagardeAO = saturate(pow(ndv + visibility, exp2(-16.0 * perceptualRoughness - 1.0)) - 1.0 + visibility);
        // horizon occlusion with falloff, should be computed for direct specular too
        float horizon = min(1.0 + dot(S.rDir, S.nDir), 1.0);
        float horizonAO = horizon * horizon;
        return lagardeAO * horizonAO;
    }

    // Jimenez et al. 2016, "Practical Realtime Strategies for Accurate Indirect Occlusion"
    /**
     * Returns a color ambient occlusion based on a pre-computed visibility term.
     * The albedo term is meant to be the diffuse color or f0 for the diffuse and
     * specular terms respectively.
     */
    vec3 GTAO_MultiBounce(float visibility, vec3 albedo) {
        
        vec3 a =  2.0404 * albedo - 0.3324;
        vec3 b = -4.7951 * albedo + 0.6417;
        vec3 c =  2.7552 * albedo + 0.6903;
        return max(vec3(visibility), ((visibility * a + b) * visibility + c) * visibility);
    }

    // ------ Precaculated DGF ------
    //use EnvBRDF to compare with EnvBRDFApprox
    /*
    vec3 EnvBRDF( SurfaceParams S )
    {
        float ndv = max(0.0, dot(S.nDir, S.vDir));
        float perceptualRoughness = S.roughParams.x;

        // Importance sampled preintegrated G * F
        vec2 AB = texture( u_DGFLutTex, vec2( ndv, perceptualRoughness ) ).rg;

        // Anything less than 2% is physically impossible and is instead considered to be shadowing 
        vec3 GF = S.specCol * AB.x + saturate( 50.0 * S.specCol.g ) * AB.y;
        return GF;
    }
    */

    //https://www.unrealengine.com/zh-CN/blog/physically-based-shading-on-mobile
    vec3 EnvBRDFApprox( SurfaceParams S )
    {
        float ndv = max(0.0, dot(S.nDir, S.vDir));
        float perceptualRoughness = S.roughParams.x;
        // [ Lazarov 2013, "Getting More Physical in Call of Duty: Black Ops II" ]
        // Adaptation to fit our G term.
        const vec4 c0 = vec4( -1, -0.0275, -0.572, 0.022 );
        const vec4 c1 = vec4( 1, 0.0425, 1.04, -0.04 );
        vec4 r = perceptualRoughness * c0 + c1;
        float a004 = min( r.x * r.x, exp2( -9.28 * ndv ) ) * r.x + r.y;
        vec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;

        // Anything less than 2% is physically impossible and is instead considered to be shadowing
        // Note: this is needed for the 'specular' show flag to work, since it uses a SpecularColor of 0
        AB.y *= saturate( 50.0 * S.specCol.g );

        return S.specCol * AB.x + AB.y;
    }

    #ifdef ClearCoat
        vec3 EnvBRDFApprox_Coat( SurfaceParams S, out float coatAttenuate)
        {
            vec3 specCol = vec3(0.04, 0.04, 0.04);
            float ndv = max(0.0, dot(S.cnDir, S.vDir));
            float perceptualRoughness = S.clearCoatRoughParams.x;
            // [ Lazarov 2013, "Getting More Physical in Call of Duty: Black Ops II" ]
            // Adaptation to fit our G term.
            const vec4 c0 = vec4( -1, -0.0275, -0.572, 0.022 );
            const vec4 c1 = vec4( 1, 0.0425, 1.04, -0.04 );
            vec4 r = perceptualRoughness * c0 + c1;
            float a004 = min( r.x * r.x, exp2( -9.28 * ndv ) ) * r.x + r.y;
            vec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;

            // Anything less than 2% is physically impossible and is instead considered to be shadowing
            // Note: this is needed for the 'specular' show flag to work, since it uses a SpecularColor of 0
            AB.y *= saturate( 50.0 * specCol.g );
            coatAttenuate = 1.0 - F_Schlick(specCol, ndv).r * S.clearCoat;

            return (specCol * AB.x + AB.y) * S.clearCoat;
        }
    #endif

    // ------ UV mapping ------
    vec2 GetPanoramicTexCoordsFromDir(vec3 dir, float rotation)
    {
        dir = normalize(dir);
        vec2 uv;
        uv.x    = (Atan2(dir.x, -dir.z) - 0.5 * M_PI) / (2.0 * M_PI);
        uv.y    = acos(dir.y) / M_PI;
        uv.x   += rotation;
        uv.x    = fract(uv.x + floor(uv.x) + 1.0);

        return uv;
    }


    vec3 SamplerEncodedPanoramicWithUV(sampler2D panoramic, vec2 uv, float lod)
    {
        float lodMin = floor(lod);
        float lodLerp = lod - lodMin;
        vec2 uvLodMin = uv;
        vec2 uvLodMax = uv;
        vec2 size = vec2(0.0);
        if(abs(lodMin - 0.0) < 0.001)
        {
            uvLodMin.x  = (uv.x * (512.0 - 1.0) / 512.0 + 0.5 / 512.0) * 1.0 + 0.0;
            uvLodMin.y  = (uv.y * (256.0 - 1.0) / 256.0 + 0.5 / 256.0) * 0.5 + 0.0;
            uvLodMax.x  = (uv.x * (256.0 - 1.0) / 256.0 + 0.5 / 256.0) * 0.5 + 0.0;
            uvLodMax.y  = (uv.y * (128.0 - 1.0) / 128.0 + 0.5 / 128.0) * 0.25 + 0.5;
        }
        else if(abs(lodMin - 1.0) < 0.001)
        {
            uvLodMin.x  = (uv.x * (256.0 - 1.0) / 256.0 + 0.5 / 256.0) * 0.5 + 0.0;
            uvLodMin.y  = (uv.y * (128.0 - 1.0) / 128.0 + 0.5 / 128.0) * 0.25 + 0.5;
            uvLodMax.x  = (uv.x * (256.0 - 1.0) / 256.0 + 0.5 / 256.0) * 0.5 + 0.5;
            uvLodMax.y  = (uv.y * (128.0 - 1.0) / 128.0 + 0.5 / 128.0) * 0.25 + 0.5;
        }
        else if(abs(lodMin - 2.0) < 0.001)
        {
            uvLodMin.x  = (uv.x * (256.0 - 1.0) / 256.0 + 0.5 / 256.0) * 0.5 + 0.5;
            uvLodMin.y  = (uv.y * (128.0 - 1.0) / 128.0 + 0.5 / 128.0) * 0.25 + 0.5;
            uvLodMax.x  = (uv.x * (256.0 - 1.0) / 256.0 + 0.5 / 256.0) * 0.5 + 0.0;
            uvLodMax.y  = (uv.y * (128.0 - 1.0) / 128.0 + 0.5 / 128.0) * 0.25 + 0.75;
        }
        else if(abs(lodMin - 3.0) < 0.001)
        {
            uvLodMin.x  = (uv.x * (256.0 - 1.0) / 256.0 + 0.5 / 256.0) * 0.5 + 0.0;
            uvLodMin.y  = (uv.y * (128.0 - 1.0) / 128.0 + 0.5 / 128.0) * 0.25 + 0.75;
            uvLodMax.x  = (uv.x * (128.0 - 1.0) / 128.0 + 0.5 / 128.0) * 0.25 + 0.5;
            uvLodMax.y  = (uv.y * (64.0 - 1.0) / 64.0 + 0.5 / 64.0) * 0.125 + 0.75;
        }
        else if(abs(lodMin - 4.0) < 0.001)
        {
            uvLodMin.x  = (uv.x * (128.0 - 1.0) / 128.0 + 0.5 / 128.0) * 0.25 + 0.5;//1
            uvLodMin.y  = (uv.y * (64.0 - 1.0) / 64.0 + 0.5 / 64.0) * 0.125 + 0.75;//1
            uvLodMax.x  = (uv.x * (128.0 - 1.0) / 128.0 + 0.5 / 128.0) * 0.25 + 0.75;//2
            uvLodMax.y  = (uv.y * (64.0 - 1.0) / 64.0 + 0.5 / 64.0) * 0.125 + 0.75;//2
        }
        else if(abs(lodMin - 5.0) < 0.001)
        {
            uvLodMin.x  = (uv.x * (128.0 - 1.0) / 128.0 + 0.5 / 128.0) * 0.25 + 0.75;//2
            uvLodMin.y  = (uv.y * (64.0 - 1.0) / 64.0 + 0.5 / 64.0) * 0.125 + 0.75;//2
            uvLodMax.x  = (uv.x * (128.0 - 1.0) / 128.0 + 0.5 / 128.0) * 0.25 + 0.5;//3
            uvLodMax.y  = (uv.y * (64.0 - 1.0) / 64.0 + 0.5 / 64.0) * 0.125 + 0.875;//3
        }
        else if(abs(lodMin - 6.0) < 0.001)
        {
            uvLodMin.x  = (uv.x * (128.0 - 1.0) / 128.0 + 0.5 / 128.0) * 0.25 + 0.5;//3
            uvLodMin.y  = (uv.y * (64.0 - 1.0) / 64.0 + 0.5 / 64.0) * 0.125 + 0.875;//3
            uvLodMax.x  = (uv.x * (128.0 - 1.0) / 128.0 + 0.5 / 128.0) * 0.25 + 0.75;//4
            uvLodMax.y  = (uv.y * (64.0 - 1.0) / 64.0 + 0.5 / 64.0) * 0.125 + 0.875;//4
        }
        else if(abs(lodMin - 7.0) < 0.001)
        {
            uvLodMin.x  = (uv.x * (128.0 - 1.0) / 128.0 + 0.5 / 128.0) * 0.25 + 0.75;//4
            uvLodMin.y  = (uv.y * (64.0 - 1.0) / 64.0 + 0.5 / 64.0) * 0.125 + 0.875;//4
            uvLodMax.x  = (uv.x * (128.0 - 1.0) / 128.0 + 0.5 / 128.0) * 0.25 + 0.75;//4
            uvLodMax.y  = (uv.y * (64.0 - 1.0) / 64.0 + 0.5 / 64.0) * 0.125 + 0.875;//4
        }
        vec4 envEncoded = mix(texture(panoramic, uvLodMin), texture(panoramic, uvLodMax), lodLerp);
        return envEncoded.rgb / envEncoded.a;
    }


    vec3 SamplerEncodedPanoramic(sampler2D panoramic, vec3 dir, float rotation, float lod)
    {
        vec2 uv = GetPanoramicTexCoordsFromDir(dir, rotation);
        return SamplerEncodedPanoramicWithUV(panoramic, uv, lod);
    }
    // ------ Indrecit Diffuse ------
    vec3 Diffuse_Panoramic(SurfaceParams S, EnvironmentParams E, sampler2D envTex)
    {
        vec3 lighting = SamplerEncodedPanoramic(envTex, S.nDir, E.rotation, AE_MIP_LEVEL);
        vec3 multiBounceColor = GTAO_MultiBounce(S.occParams.x, S.diffCol);
        return lighting * S.diffCol * multiBounceColor * E.intensity;
    }

     #ifdef Subsurface
    // //https://google.github.io/filament/Filament.md.html
    vec3 Diffuse_Panoramic_Subsurface(SurfaceParams S, EnvironmentParams E, sampler2D envTex)
    {
        vec3 iblDiffuse = Diffuse_Panoramic(S, E, envTex);
        float lod = S.roughParams.x * AE_MIP_LEVEL + 2.0 - S.thin;
        vec3 viewDependent = SamplerEncodedPanoramic(envTex, -S.vDir, E.rotation, lod);
        float attenuation = S.thin / (2.0 * M_PI);
        vec3 iblTransmit = S.subsurfaceCol.rgb * S.diffCol * viewDependent * attenuation * E.intensity;
        return iblTransmit + iblDiffuse;
    }
    #endif

    // ------ Indrecit Specluar ------
    vec3 Specular_Panoramic(SurfaceParams S, EnvironmentParams E, sampler2D envTex)
    {
        //from Moving Frostbite to Physically Based Rendering 
        vec3 dir = mix(S.rDir, S.nDir, S.roughParams.x * S.roughParams.y);
        //https://google.github.io/filament/Filament.md.html      5.3.4.4
        vec3 specEnv = SamplerEncodedPanoramic(envTex, dir, E.rotation, (S.roughParams.x - B_PBR_MIN_ROUGH) * AE_MIP_LEVEL);
        vec3 brdf = EnvBRDFApprox(S);
        vec3 multiBounceColor = GTAO_MultiBounce(S.occParams.y, S.specCol);
        return brdf * specEnv * multiBounceColor * E.intensity;
    }
 
    #ifdef ClearCoat
    vec3 Specular_Panoramic_Coat(SurfaceParams S, EnvironmentParams E, sampler2D envTex, out float coatAttenuate)
    {
        vec3 specEnv = SamplerEncodedPanoramic(envTex, S.crDir, E.rotation, (S.clearCoatRoughParams.x - B_PBR_MIN_ROUGH) * AE_MIP_LEVEL);
        vec3 brdf = EnvBRDFApprox_Coat(S, coatAttenuate);
        return brdf * specEnv * E.intensity;
    }
    #endif



    // ------Indrecit  Refraction ------
    #ifdef Refraction
    struct RefractRay {
        vec3 position;
        vec3 direction;
        float d;
    };

    void RefractionSolidSphere(SurfaceParams S, out RefractRay ray)
    {
        vec3 r = refract(S.rDir, S.nDir, 1.0 / S.ior);
        float NoR = dot(S.nDir, r);
        float d = (1.0 - S.thin) * -NoR;
        ray.position = vec3(S.pos + r * d);
        ray.d = d;
        vec3 n1 = normalize(NoR * r - S.nDir * 0.5);
        ray.direction = refract(r, n1, S.ior);
    }

    void RefractionSolidBox(SurfaceParams S, out RefractRay ray)
    {
        vec3 rr = refract(S.rDir, S.nDir, 1.0 / S.ior);
        float NoR = dot(S.nDir, rr);
        float d = (1.0 - S.thin) / max(-NoR, 0.001);
        ray.position = vec3(S.pos + rr * d);
        ray.direction = S.rDir;
        ray.d = d;
    #ifndef AMAZING_USE_BLENDMODE_COLOREDGLASS
        // fudge direction vector, so we see the offset due to the thin of the object
        float envDistance = 10.0; // this should come from a ubo
        ray.direction = normalize((ray.position - S.pos) + ray.direction * envDistance);
    #endif
    }


    vec3 ApplyRefraction(SurfaceParams S, EnvironmentParams E, sampler2D envTex, vec3 Fd)
    {
        RefractRay ray;

    #ifdef BoxRefractionMode
        RefractionSolidBox(S, ray);
    #else
        RefractionSolidSphere(S, ray);
    #endif

        /* compute transmission T */
        vec3 absorption = -log(Clamp(S.diffCol, 1e-5, 1.0)) / S.transmittanceColorAtDistance;
        vec3 T = min(vec3(1.0), exp(-absorption * ray.d));

        float perceptualRoughness = S.roughParams.x - B_PBR_MIN_ROUGH;

        /* sample the screen-space or cubemap*/
    #ifdef AMAZING_USE_BLENDMODE_COLOREDGLASS
        // compute the point where the ray exits the medium, if needed
        vec4 posProjected = u_VP * vec4(ray.position, 1.0);
        vec2 uv = (posProjected.xy / posProjected.w) * 0.5 + vec2(0.5, 0.5);

        //sample the background
        float gloss = 1.0 - perceptualRoughness;
        float lod = AE_MIP_LEVEL - AE_MIP_LEVEL * (gloss * gloss);
        vec3 background = texture( u_FBOTexture, uv, lod ).xyz;
        
        #ifdef RefractionBlurMode
            vec2 psize = v_pixelSize * exp2( lod ) * saturate(lod) * 0.5;
            
            //background blur samples
            vec2 K = vec2( 23.14069263277926, 2.665144142690225 );
            float rnd = fract( cos( dot(uv,K) ) * 12345.6789 );
            float sampleTheta = (2.0 * 3.141593) * rnd * 1.0;
            float sinTheta = sin(sampleTheta);
            float cosTheta = cos(sampleTheta);
            vec4 kern = vec4(cosTheta, sinTheta, -sinTheta, cosTheta) * psize.xyxy;

            #define ZERO vec4(0.0,0.0,0.0,0.0)  
            background += texture( u_FBOTexture, uv - (kern.xy - kern.zw), lod ).xyz;
            background += texture( u_FBOTexture, uv - (kern.xy + ZERO.zw), lod ).xyz;
            background += texture( u_FBOTexture, uv - (kern.xy + kern.zw), lod ).xyz;
            background += texture( u_FBOTexture, uv + (ZERO.xy - kern.zw), lod ).xyz;
            background += texture( u_FBOTexture, uv + (ZERO.xy + kern.zw), lod ).xyz;
            background += texture( u_FBOTexture, uv + (kern.xy - kern.zw), lod ).xyz;
            background += texture( u_FBOTexture, uv + (kern.xy + ZERO.zw), lod ).xyz;
            background += texture( u_FBOTexture, uv + (kern.xy + kern.zw), lod ).xyz;
            background /= 9.0;
        #endif
        vec3 Ft = GammaToLinear(background);
    
    #else
        // when reading from the cubemap, we are not pre-exposed so we apply iblLuminance
        // which is not the case when we'll read from the screen-space buffer
        vec3 Ft = SamplerEncodedPanoramic(envTex, ray.direction, E.rotation, perceptualRoughness * AE_MIP_LEVEL) * E.intensity;
    #endif

        /* fresnel from the first interface */
        vec3 specCol = S.specCol;
        float ndv = max(0.0, dot(S.nDir, S.vDir));
        vec3 FtAttenuate = vec3(1.0, 1.0, 1.0) - F_Schlick(specCol, ndv);
        Ft *= FtAttenuate;

        // color absorption
        Ft *= T;
        return mix(Fd, Ft, S.transmittance);
    }
    #endif

    // ------ Build Params ------
    VSOutput BuildVSOutput()
    {
        VSOutput V;  
            V.posWS  = v_posWS;
            V.nDirWS = normalize(v_nDirWS);
            V.tDirWS = normalize(v_tDirWS);
            V.bDirWS = normalize(v_bDirWS);
        return V;
    }


    SurfaceParams BuildSurfaceParams(VSOutput V, PARAMETERS_DEFINE)
    {
        SurfaceParams S;
            S.albedo                       = albedo;
            S.opacity                      = opacity;

            
            #ifdef AMAZING_USE_BLENDMODE_ALPHATEST
                if(S.opacity < S.cutoff)
                    discard;
            #endif
         
         
            S.metalParams.x                = saturate(metallic);
            S.metalParams.y                = 0.96 * (1.0 - S.metalParams.x);
            S.roughParams.x                = clamp(roughness, B_PBR_MIN_ROUGH, B_PBR_MAX_ROUGH);
            S.roughParams.y                = Pow2(S.roughParams.x);
            S.roughParams.z                = Pow2(S.roughParams.y);

 
            S.occParams.x                  = saturate(ao);
                 
            #ifdef ClearCoat
            S.clearCoatRoughParams.x       = clamp(clearCoatRoughness, B_PBR_MIN_ROUGH, S.roughParams.x);
            S.clearCoatRoughParams.y       = Pow2(S.clearCoatRoughParams.x);
            S.clearCoatRoughParams.z       = Pow2(S.clearCoatRoughParams.y);
            #endif
         
 
            S.thin                         = saturate(thin);
        
            S.clearCoat                    = clearCoat;
 
            S.emissive                     = emissive;
           
            S.diffCol                      = S.albedo * S.metalParams.y;
            S.specCol                      = mix(vec3(0.04), S.albedo, S.metalParams.x);
 
         
            S.subsurface                   = subsurface;
            S.subsurfaceColMultiply        = subsurfaceColMultiply;
            S.subsurfaceCol                = subsurfaceCol;

            S.ior                          = ior;
            S.transmittance                = transmittance;
            S.transmittanceColorAtDistance = transmittanceColorAtDistance;

         


            //world dir
            S.pos                          = V.posWS;
            S.vnDir                        = V.nDirWS;
          
            S.nDir                         = normal;
            S.cnDir                        = clearCoatNormal;
            #ifdef Anisotropic
            S.anisoParams.x                = anisotropicRotate * M_PI * 2.0;
            S.anisoParams.y                = anisotropic;
            float sinA                     = sin(S.anisoParams.x);
            float cosA                     = cos(S.anisoParams.x);
            S.bDir                         = cosA * V.bDirWS + sinA * V.tDirWS;

            S.tDir                         = normalize(cross(S.nDir, S.bDir));
            S.bDir                         = normalize(cross(S.nDir, S.tDir));
            #else
            S.tDir                         = V.tDirWS;
            S.bDir                         = V.bDirWS;
            #endif
          
           
            S.vDir                         = normalize(u_WorldSpaceCameraPos - V.posWS);
            S.vDir                         = dot(S.vDir, S.nDir) < 0.0 ? reflect(S.vDir, S.nDir) : S.vDir;


            #ifdef Anisotropic
            S.nDir                         = GetAnisotropicModifiedNormal(S.tDir, S.nDir, S.vDir, S.anisoParams.y);
            #endif

            S.rDir                         = normalize(reflect(-S.vDir, S.nDir));
            #ifdef ClearCoat
            S.crDir                         = normalize(reflect(-S.vDir, S.cnDir));
            #endif

            S.occParams.y                  = SpecularAO(S);
        return S;
    }

  

    EnvironmentParams BuildEnvironmentParams(float envInt, float envRot)
    {
        EnvironmentParams E;
            E.intensity = envInt;
            E.rotation  = envRot;
        return E;
    }


    // ------ Build Lights ------
    struct LightGroupParams
    {
        #ifdef AE_DirLightNum
            #if AE_DirLightNum > 0
                LightParams DirLights[AE_DirLightNum];
            #endif
        #endif

        #ifdef AE_PointLightNum
            #if AE_PointLightNum > 0
                LightParams PointLights[AE_PointLightNum];
            #endif
        #endif

        #ifdef AE_SpotLightNum
            #if AE_SpotLightNum > 0
                LightParams SpotLights[AE_SpotLightNum];
            #endif
        #endif

        float dummy;
    };

    LightParams BuildDirLightParams(SurfaceParams S, int index)
    {
        LightParams ML;
        ML.lDir      = normalize(-u_DirLightsDirection[index]);
        ML.color     = u_DirLightsColor[index];
        ML.intensity = u_DirLightsIntensity[index] * u_DirLightsEnabled[index];
        ML.attenuate = vec3(1.0, 1.0, 1.0);
        return ML;
    }

    LightParams BuildPointLightParams(SurfaceParams S, int index)
    {
        vec3 lVec        = vec3(0.0);
        float lDist      = 0.0;
        LightParams PL1;
        lVec             = u_PointLightsPosition[index] - S.pos;
        lDist            = length(lVec);
        PL1.lDir         = lVec / lDist;
        PL1.color        = u_PointLightsColor[index];
        PL1.intensity    = u_PointLightsIntensity[index] * u_PointLightsEnabled[index];
        lDist           *= u_PointLightsAttenRangeInv[index];
        float attenuate  = Pow2(saturate(1.0 - Pow4(lDist))) * (Pow2(lDist) + 1.0) * 0.25;
        PL1.attenuate    = vec3(attenuate,attenuate,attenuate);
        return PL1;
    }

    LightParams BuildSpotLightParams(SurfaceParams S, int index)
    {
        vec3 lVec        = vec3(0.0);
        float lDist      = 0.0;

        vec3 spotDir     = vec3(0.0);
        float angleAtten = 0.0;

        LightParams SL1;
        lVec             = u_SpotLightsPosition[index] - S.pos;
        lDist            = length(lVec);
        SL1.lDir         = lVec / lDist;
        SL1.color        = u_SpotLightsColor[index];
        SL1.intensity    = u_SpotLightsIntensity[index] * u_SpotLightsEnabled[index];
        lDist           *= u_SpotLightsAttenRangeInv[index];
        float attenuate  = Pow2(saturate(1.0 - Pow4(lDist))) * (Pow2(lDist) + 1.0) * 0.25;
        spotDir          = normalize(-u_SpotLightsDirection[index]);
        angleAtten       = max(0.0, dot(SL1.lDir, spotDir));
        attenuate       *= smoothstep(u_SpotLightsOuterAngleCos[index], u_SpotLightsInnerAngleCos[index], angleAtten);
        SL1.attenuate    = vec3(attenuate,attenuate,attenuate);
        return SL1;
    }

    LightGroupParams BuildLightGroupParams(SurfaceParams S)
    {
        LightGroupParams LG;
        LG.dummy = 0.0;

         #ifdef AE_DirLightNum
            #if AE_DirLightNum > 0
                LG.DirLights[0] = BuildDirLightParams(S, 0);
                #ifdef Shadow
                    vec4 shadowFactor = Shadowing(S, LG.DirLights[0]);
                    LG.DirLights[0].attenuate = mix(shadowFactor.rgb, LG.DirLights[0].attenuate, shadowFactor.a);
                #endif
            #endif
            #if AE_DirLightNum > 1
                LG.DirLights[1] = BuildDirLightParams(S, 1);
            #endif
            #if AE_DirLightNum > 2
                LG.DirLights[2] = BuildDirLightParams(S, 2);
            #endif
        #endif

        #ifdef AE_PointLightNum
            #if AE_PointLightNum > 0
               LG.PointLights[0] = BuildPointLightParams(S, 0);
            #endif
            #if AE_PointLightNum > 1
               LG.PointLights[1] = BuildPointLightParams(S, 1);
            #endif
            #if AE_PointLightNum > 2
               LG.PointLights[2] = BuildPointLightParams(S, 2);
            #endif
        #endif

        #ifdef AE_SpotLightNum
            #if AE_SpotLightNum > 0
               LG.SpotLights[0] = BuildSpotLightParams(S, 0);
            #endif
            #if AE_SpotLightNum > 1
               LG.SpotLights[1] = BuildSpotLightParams(S, 1);
            #endif
            #if AE_SpotLightNum > 2
               LG.SpotLights[2] = BuildSpotLightParams(S, 2);
            #endif
        #endif
        return LG;
    }

    // ---------------- Lighting ---------------------
    vec3 Lighting(VSOutput V,
        SurfaceParams S,
        EnvironmentParams E,
        sampler2D envTex,
        LightGroupParams LG)
    {
         // ------ LightMode ------
        vec3 Fd = vec3(0.0);
        vec3 Fr = vec3(0.0);

        float coatAttenuate_IBL = 1.0;
        #ifdef ClearCoat
            Fr += Specular_Panoramic_Coat(S, E, envTex, coatAttenuate_IBL);  
        #endif

        #ifdef Subsurface
            Fd += Diffuse_Panoramic_Subsurface(S, E, envTex) * coatAttenuate_IBL;
        #else
            Fd += Diffuse_Panoramic(S, E, envTex) * coatAttenuate_IBL;
        #endif
 
        Fr += Specular_Panoramic(S, E, envTex) * coatAttenuate_IBL;

        #ifdef AE_DirLightNum
            #if AE_DirLightNum > 0
                LightParams ML = LG.DirLights[0];
                float coatAttenuate_ML = 1.0;
                #ifdef ClearCoat
                    Fr += Specular_GGX_Low_Coat(S, ML, coatAttenuate_ML);
                #endif

                #ifdef Subsurface
                    Fd += SubsurfaceTerm(S, ML) * coatAttenuate_ML;
                #else
                    Fd += DIFFUSE_HIGH(S, ML) * coatAttenuate_ML;
                #endif
                    Fr += SPECULAR_HIGH(S, ML) * coatAttenuate_ML;
            #endif
             

            #if AE_DirLightNum > 1
                for(int i = 1; i < AE_DirLightNum; i++)
                {
                    LightParams DL = LG.DirLights[i];
                    float coatAttenuate_DL = 1.0;
                    #ifdef ClearCoat
                        Fr += Specular_GGX_Low_Coat(S, DL, coatAttenuate_DL);
                    #endif
                    Fd += DIFFUSE_LOW(S, DL) * coatAttenuate_DL;
                    Fr += SPECULAR_LOW(S, DL) * coatAttenuate_DL;
                }
            #endif   
           
        #endif


        #ifdef AE_PointLightNum
            #if AE_PointLightNum > 0
                for(int i = 0; i < AE_PointLightNum; i++)
                {
                    LightParams PL = LG.PointLights[i];
                    float coatAttenuate_PL = 1.0;
                    #ifdef ClearCoat
                        Fr += Specular_GGX_Low_Coat(S, PL, coatAttenuate_PL);
                    #endif

                    Fd += DIFFUSE_LOW(S, PL) * coatAttenuate_PL;
                    Fr += SPECULAR_LOW(S, PL) * coatAttenuate_PL;
                }
            #endif
        #endif


        #ifdef AE_SpotLightNum
            #if AE_SpotLightNum > 0
                for(int i = 0; i < AE_SpotLightNum; i++)
                {
                    LightParams SL = LG.SpotLights[i];
                    float coatAttenuate_SL = 1.0;
                    #ifdef ClearCoat
                        Fr += Specular_GGX_Low_Coat(S, SL, coatAttenuate_SL);
                    #endif

                    Fd += DIFFUSE_LOW(S, SL) * coatAttenuate_SL;
                    Fr += SPECULAR_LOW(S, SL) * coatAttenuate_SL;
                }
            #endif
            
        #endif

        #ifdef Emissive
                Fd += EmissiveTerm(S);
        #endif        

        #ifdef Refraction
                Fd = ApplyRefraction(S, E, envTex, Fd);
        #endif

        vec3 finalRGB = Fd + Fr; 
        return finalRGB;
    }

    vec4 MainEntry(sampler2D envTex, PARAMETERS_DEFINE)
    {
        // ------ RenderData ------
        VSOutput V          = BuildVSOutput();
        SurfaceParams S     = BuildSurfaceParams(V, PARAMETERS_PASS);
        EnvironmentParams E = BuildEnvironmentParams(envInt, envRot);
        LightGroupParams LG = BuildLightGroupParams(S);
       
        // ------ Lighting ------
        vec3 finalRGB       = Lighting(V, S, E, envTex, LG);

        // ------ PostProcess ------
        #ifdef ToneMapping
        finalRGB            = LinearToneMapping(finalRGB);
        #endif
        finalRGB            = LinearToGamma(finalRGB);

        vec4 result         = vec4(finalRGB, S.opacity);
        
        return result;
    }

    // ----------------------- Main -----------------------
    void main ()
    {
        VARIABLES_DEFINE

        vec2 uv0 = v_uv0;
        #ifdef Parallax
            float height = texture(u_ThinHeightTex, v_uv0).b;   
            height = ParamMapingOffset(height, u_HeightOffset);
            float parallax = ParamMapingScale(height, u_ParallaxInt);
 
            vec2 texCoordOffsets = ParallaxOffset(parallax); 
            uv0 += texCoordOffsets;
        #endif

    
        envInt = u_EnvInt;
        envRot = u_EnvRot;

        albedo = GammaToLinear(u_AlbedoCol.rgb);
        opacity = u_AlbedoCol.a;
        
        #ifdef AlbedoTex
            vec4 t_AlbedoTex = texture(u_AlbedoTex, uv0);
            albedo *= GammaToLinear(t_AlbedoTex.rgb);
            opacity *= t_AlbedoTex.a;
            cutoff = u_Cutoff;
        #endif        


        #ifdef MRATex
            vec3 t_MaskTex = texture(u_MRATex, uv0).xyz;
            metallic = ParamMapingOffset(t_MaskTex.r, u_Metallic);
            roughness = ParamMapingOffset(t_MaskTex.g, u_Roughness);
            ao  = ParamMapingScaleDark(t_MaskTex.b, u_Occlusion);
        #else
            metallic = u_Metallic;
            roughness = u_Roughness;
            ao = 1.0;
        #endif


        #if defined(NormalTexture) || defined(DetailNormal)
            mat3 TBN = mat3(normalize(v_tDirWS), normalize(v_bDirWS), normalize(v_nDirWS));
            normal = clearCoatNormal = vec3(0.0, 0.0, 1.0);

            //blend normal
            #ifdef NormalTexture
                vec3 normalTS = texture(u_NormalTexture, uv0).xyz;
                normal = clearCoatNormal = DecodeNormal(normalTS, u_NormInt);
            #endif

            #ifdef DetailNormal
                vec2 detailNormalUV = uv0 * vec2(u_DetailNormalTilingU, u_DetailNormalTilingV);
                vec3 detailNormalTS = vec3(0.0, 0.0, 1.0);

                #ifdef DetailNormalParallax
                    int detailNormalParallaxCount = 3;
                    //negative is depth
                    vec2 parallaxOffset = -u_DetailNormalParallaxDepth * v_viewDirTS.xy / v_viewDirTS.z; 
                    //uv.y is alway inversed
                    parallaxOffset.y = -parallaxOffset.y;
                    for(int i = detailNormalParallaxCount - 1; i >= 0 ; i--)
                    {
                        vec2 detailNormalUV_parallax = detailNormalUV + (parallaxOffset + vec2(3.634523,5.7544)) * float(i);
                        vec3 detailNormalTS_parallax = texture(u_DetailNormalTex, detailNormalUV_parallax).xyz;
                        detailNormalTS_parallax = DecodeNormal(detailNormalTS_parallax, u_DetailNormalInt);

                        if(detailNormalTS_parallax.z < 0.99)
                        {
                            detailNormalTS = detailNormalTS_parallax;
                            metallic = u_DetailNormalParallaxMetalic;
                            roughness = u_DetailNormalParallaxRoughness;
                            #ifdef DetailNormalColorTex
                                albedo = GammaToLinear(texture(u_DetailNormalColorTex, uv0).rgb);
                            #endif
                        }
                    }
                    normal = BlendNormal(normal, detailNormalTS);
                #else
                    vec3 detailNormalTS_top = texture(u_DetailNormalTex, detailNormalUV).xyz;
                    detailNormalTS = DecodeNormal(detailNormalTS_top, u_DetailNormalInt);
                    normal = BlendNormal(normal, detailNormalTS);
                #endif
            #endif
 
            //normal to world space
            clearCoatNormal = TBN * clearCoatNormal;
            #ifdef DetailNormal
                normal = TBN * normal;
            #else
                normal = clearCoatNormal;    
            #endif
       
        #else
            normal = clearCoatNormal = normalize(v_nDirWS);
        #endif
  
        #ifdef Subsurface
            subsurface = u_Subsurface;
            subsurfaceCol = u_SubsurfaceCol.rgb;
            subsurfaceColMultiply = GammaToLinear(texture(u_SubsurfaceAlbedoBlurTex, uv0).rgb);
        #endif    

        #ifdef Refraction
            ior = u_IOR;
            transmittance = u_Transmittance;
            transmittanceColorAtDistance = u_TransmittanceColorAtDistance;
        #endif    

        #ifdef ClearCoat
            clearCoat = u_ClearCoatInt;
            clearCoatRoughness = u_ClearCoatRoughness;
        #endif

        #if defined(Subsurface) || defined(Refraction)
            vec4 t_Mask2Tex = texture(u_ThinHeightTex, uv0);

            thin = ParamMapingOffset(t_Mask2Tex.r, u_Thin);
        #endif
     
        #ifdef Emissive
            vec4 t_EmissiveTex = texture(u_EmissiveTex, uv0);
            emissive = GammaToLinear(u_EmissiveCol.rgb) * GammaToLinear(t_EmissiveTex.rgb) * u_EmissiveInt;
        #endif

        #ifdef Anisotropic
            vec2 t_AnistropicTex = texture(u_AnisotropicRotateIntensityTex, v_uvAniso).rg;   
            anisotropic = ParamMapingScale(t_AnistropicTex.g, u_AnisotropicInt);
            anisotropicRotate = ParamMapingOffset(t_AnistropicTex.r, u_AnisotropicRotate);
        #endif
 
        vec4 finalColor = MainEntry(u_EnvTex, PARAMETERS_PASS);

        vec4 proj_pos = u_VP * vec4(v_posWS, 1.0);
        vec2 ndc_coord = proj_pos.xy / proj_pos.w;
        vec2 screen_coord = ndc_coord * 0.5 + vec2(0.5, 0.5);
        glResult = ApplyBlendMode(finalColor, screen_coord);
    }

