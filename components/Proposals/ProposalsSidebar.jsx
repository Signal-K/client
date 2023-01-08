import React, { useState } from "react";
import Link from "next/link";
import { logo, sun } from '../../assets';
import { navlinks } from '../../pages/api/proposals/constants';
import styles from '../styles/Header.module.css';

const Icon = ({ styles, name, imgUrl, isActive, disabled, handleClick }) => (
    <div className={`w-[48px] h-[48px] rounded-[10px] ${isActive && isActive === name && 'bg-[#2c2f32]'} flex justify-center items-center ${!disabled && 'cursor-pointer'} ${styles}`} onClick={handleClick}>
        {!isActive ? (
            <img src={imgUrl} alt="fund_logo" className="w-1/2 h-1/2" />
        ) : (
            <img src={imgUrl} alt="fund_logo" className={`w-1/2 h-1/2 ${isActive !== name && 'grayscale'}`} />
        )}
    </div>
)

const ProposalsSidebar = () => {
    const [isActive, setIsActive] = useState('dashboard');

    return (
        <div className="flex justify-between items-center flex-col sticky top-5 h-[93vh]">
            <Link href='/'>
                <Icon styles="bg-[#2c2f32]" width='16px' height='16px' imgUrl="/logo.png"/>
            </Link>
            <div className="flex-1 flex flex-col justify-between items-center bg-[#1c1c24] rounded-[20px] w-[76px] py-4 mt-12">
                <div className="flex flex-col justify-center items-center gap-3">
                    <Link href="/profile/parselay.lens"><Icon styles='bg-[#2c2f32] w-[16px] h-[16px]' imgUrl='/create-campaign.svg' isActive={isActive} /></Link>
                </div>
            </div>
        </div>
    )
}

export default ProposalsSidebar;