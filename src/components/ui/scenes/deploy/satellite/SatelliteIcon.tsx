
import React, { useMemo } from "react";
import Image from "next/image";

interface SatelliteIconProps {
	deployTime: Date;
	currentTime: Date;
	tile: string;
	unlocked: boolean;
	width?: number;
	height?: number;
}

// Calculate position as a percentage based on time since deploy
function getSatellitePosition(deployTime: Date, currentTime: Date) {
	// Move from left (0%) to right (100%) over 7 days
	const totalDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
	const elapsed = Math.max(0, Math.min(currentTime.getTime() - deployTime.getTime(), totalDuration));
	const percent = (elapsed / totalDuration) * 100;
	return percent;
}

const SatelliteIcon: React.FC<SatelliteIconProps> = ({
	deployTime,
	currentTime,
	tile,
	unlocked,
	width = 59,
	height = 59,
}) => {
	// Calculate horizontal position (left: percent%)
	const leftPercent = useMemo(() => getSatellitePosition(deployTime, currentTime), [deployTime, currentTime]);

	return (
		<div
			style={{
				position: "absolute",
				top: "50%",
				left: `${leftPercent}%`,
				transform: "translate(-50%, -50%)",
				transition: "left 1s linear",
				zIndex: 10,
			}}
		>
			<Image
				src={tile}
				alt="Satellite"
				width={width}
				height={height}
				style={{
					transition: "box-shadow 0.3s",
					boxShadow: unlocked
						? "0 0 16px 4px #00ff88cc"
						: "0 0 12px 2px #ff003388",
					filter: unlocked ? "brightness(1.2)" : "brightness(0.7)",
				}}
			/>
			{/* Status indicator */}
			<div
				style={{
					position: "absolute",
					top: -12,
					left: "50%",
					transform: "translateX(-50%)",
					width: 16,
					height: 16,
					borderRadius: "50%",
					background: unlocked ? "#00ff88" : "#ff0033",
					boxShadow: unlocked
						? "0 0 8px 2px #00ff88cc"
						: "0 0 8px 2px #ff003388",
					border: "2px solid #fff",
				}}
			/>
		</div>
	);
};

export default SatelliteIcon;
