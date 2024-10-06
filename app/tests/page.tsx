"use client";

import React, { useEffect, useState, useCallback } from "react";
import Camera from "@/components/Projects/Zoodex/Upload/Camera";
import CloudUploadEarthCameraComponent from "@/components/Projects/Lidar/Upload/CloudCamera";

export default function TestPage() {
    return (
        <div>
            <CloudUploadEarthCameraComponent />
        </div>
    );
};


