    #version 300 es
    precision highp             float;
    //        Const
    const     int               MAX_BONES              =      50;
    //        Attribute

    in        vec3              attPosition;
    in        vec3              attNormal;
    in        vec2              attTexcoord0;
    in        vec3              attTangent;
    #ifdef    AMAZING_USE_BONES
    in        vec4              attBoneIds;
    in        vec4              attWeights;
    uniform   mat4              u_Palatte[MAX_BONES];
    #endif
    //        Uniform
    uniform   mat4              u_Model;
    uniform   mat4              u_InvModel;
    uniform   mat4              u_MVP;
    uniform   mat4              u_TransposeInvModel;
    uniform   vec4              u_Time;                //     x     =    gametime/20; y = gametime; z = gametime * 2; w = gametime * 3;
    uniform   vec3              u_WorldSpaceCameraPos;
    uniform   vec4              u_ScreenParams;        //x:rt width y:rt height
    #ifdef    UvControl
    uniform   vec2              u_Tiling;
    uniform   vec2              u_Offset;
    uniform   float             u_Rotation;
    #endif
    #ifdef    Anisotropic
    uniform   float             u_AnisotropicTilingU;
    uniform   float             u_AnisotropicTilingV;
    #endif
    //        Varying
    out       vec3              v_posWS;
    out       vec3              v_nDirWS;
    out       vec2              v_uv0;
    #ifdef Anisotropic
    out       vec2              v_uvAniso;
    #endif
    out       vec3              v_tDirWS;
    out       vec3              v_bDirWS;
    #ifdef    Refraction
    out       vec2              v_pixelSize;
    #endif
    #if defined(Parallax) || defined(DetailNormalParallax)
    //tangent space             view                   dir
    out       vec3              v_viewDirTS;
    #endif

    // perform scaling, rotation & translation on UV space
    vec2 UV_TRS(vec2 inputUV, vec2 uvCenter, vec2 uvPan, vec2 uvScale, float uvRotate)
    {
        vec2 minusCenterUV = inputUV - uvCenter;
        float cosVal = cos(uvRotate);
        float sinVal = sin(uvRotate);
        mat2 rotateMat = mat2(cosVal, -sinVal, sinVal, cosVal);
        
        vec2 outputUV = minusCenterUV * uvScale;
        outputUV = rotateMat * outputUV + uvCenter;
        outputUV = outputUV + uvPan;
        return outputUV;
    }


    // Main
    void main ()
    {
        vec3 attBinormal = normalize(cross(attNormal,attTangent)); 
        #ifdef AMAZING_USE_BONES
            mat4 boneTransform = u_Palatte[int(attBoneIds.x)] * attWeights.x +
                                  u_Palatte[int(attBoneIds.y)] * attWeights.y +
                                  u_Palatte[int(attBoneIds.z)] * attWeights.z +
                                  u_Palatte[int(attBoneIds.w)] * attWeights.w;
            vec3 bm_postiton   = (boneTransform * vec4(attPosition, 1.0)).xyz;
            vec3 bn_normal     = (boneTransform * vec4(attNormal, 0.0)).xyz;
            v_posWS            = (u_Model * vec4(bm_postiton, 1.0)).xyz;
            v_nDirWS           = (u_TransposeInvModel * vec4(bn_normal, 0.0)).xyz;
            vec3 bm_tangent    = (boneTransform * vec4(attTangent, 0.0)).xyz;
            vec3 bm_binormal   = (boneTransform * vec4(attBinormal, 0.0)).xyz;
            v_tDirWS           = (u_Model * vec4(bm_tangent, 0.0)).xyz;
            v_bDirWS           = (u_Model * vec4(bm_binormal, 0.0)).xyz;
            gl_Position        = u_MVP * boneTransform * vec4(attPosition, 1.0);

            #if defined(Parallax) || defined(DetailNormalParallax)
                //transform object space viewDir to tangent space viewDir
                vec4 objectSpaceCameraPos = u_InvModel * vec4(u_WorldSpaceCameraPos,1.0);
                vec3 viewDirOS            = objectSpaceCameraPos.xyz - bm_postiton;
                mat3 object2Tangent       = mat3(bm_tangent, bm_binormal, bn_normal);
                v_viewDirTS               = object2Tangent * viewDirOS;
            #endif
        #else
            v_posWS     = (u_Model * vec4(attPosition, 1.0)).xyz;
            v_nDirWS    = (u_TransposeInvModel * vec4(attNormal, 0.0)).xyz;
            v_tDirWS    = (u_Model * vec4(attTangent, 0.0)).xyz;
            v_bDirWS    = (u_Model * vec4(attBinormal, 0.0)).xyz;
            gl_Position = u_MVP * vec4(attPosition, 1.0);
            #if defined(Parallax) || defined(DetailNormalParallax)
                vec4 objectSpaceCameraPos = u_InvModel * vec4(u_WorldSpaceCameraPos,1.0);
                vec3 viewDirOS            = objectSpaceCameraPos.xyz - attPosition;
                mat3 object2Tangent       = transpose(mat3(attTangent, attBinormal, attNormal));
                v_viewDirTS               = object2Tangent * viewDirOS;
            #endif
        #endif

   
        v_uv0 = vec2(attTexcoord0.x, 1.0 - attTexcoord0.y);

        #ifdef UvControl
            // 360.0 / 6.283185307179586 = 57.295779513082
            v_uv0 = UV_TRS(v_uv0.xy, vec2(0.5, 0.5), u_Offset, u_Tiling, u_Rotation / 57.295779513082);
        #endif

        #ifdef Refraction
            v_pixelSize = vec2(1.0, 1.0) / u_ScreenParams.xy;
        #endif

        #ifdef Anisotropic
            v_uvAniso = vec2(attTexcoord0.x, 1.0 - attTexcoord0.y) * vec2(u_AnisotropicTilingU, u_AnisotropicTilingV);
        #endif    
    }

