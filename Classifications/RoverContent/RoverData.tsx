const Compass = ({ windspeed, direction }: { windspeed: number, direction: number }) => {
    // Calculate rotation angle for the needle based on direction
    const rotationAngle = direction % 360;

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="relative w-48 h-48">
                {/* Compass markings */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
    <div className="text-white absolute top-0">N</div>
    <div className="text-white absolute right-0">E</div>
    <div className="text-white absolute bottom-0">S</div>
    <div className="text-white absolute left-0">W</div>
    {Array.from({ length: 360 }, (_, i) => i).map((deg) => (
        <div
            key={deg}
            className={`absolute w-0.5 h-2 bg-white ${
                deg % 45 === 0 ? 'h-3' : ''
            }`}
            style={{ transform: `rotate(${deg}deg) translate(-50%, -50%)` }}
        ></div>
    ))}
</div>
                {/* Compass needle */}
                <div className="absolute w-0.5 h-20 bg-red-500 transform origin-bottom" style={{ left: '50%', top: '50%', transform: `rotate(${rotationAngle}deg) translate(-50%, -100%)` }}></div>
                <div className="absolute w-2 h-8 bg-green-500 transform origin-bottom" style={{ left: '50%', top: '50%', transform: `translate(-50%, -50%)` }}></div>
            </div>
            {/* Compass info */}
            <div className="mt-4 text-white text-center">
                <div className="font-bold text-lg">Wind Speed</div>
                <div>{windspeed} m/s</div>
                <div className="font-bold text-lg">Direction</div>
                <div>{direction}°</div>
            </div>
        </div>
    );
};

export default Compass;