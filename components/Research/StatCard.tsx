interface StatCardProps {
    title: string;
    value: number;
    max?: number;
    description?: string;
    icon?: React.ReactNode;
    color?: string;
};

export const StatCard = ({
    title,
    value,
    max,
    description,
    icon,
    color,
}: StatCardProps) => {
    return (
        <div className="bg-[#0f2942] border border-[#1e3a5f] p-4 rounded relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-r from-${color}/10 to-transparent`}></div>
            <div className="relative z-10">
                <div className="text-[#4cc9f0] mb-1 text-sm">{title}</div>
                <div className="text-2xl font-bold text-white">
                    {value}
                    <span className="text-[#4cc9f0">{max ? `/${max}` : " LY"}</span>
                </div>
                <div className="h-1 bg-[#1e3a5f] mt-2">
                    <div className={`h-full bg-[${color}]`} style={{ width: `${(value / (max || 3)) * 100}%` }}></div>
                </div>
            </div>
        </div>
    );
};