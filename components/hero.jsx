"use client"
import Link from 'next/link'
import React, { useEffect, useRef } from 'react'
import { Button } from './ui/button'
import Image from 'next/image'

const HeroSection = () => {

    const imageRef = useRef();

    useEffect(() => {

        const imageElement = imageRef.current;

        const scrollHandler = () => {
            const scrollPosition = window.scrollY;
            const scrollThreshold = 100;

            if(scrollPosition > scrollThreshold) imageElement.classList.add("scrolled");
            else imageElement.classList.remove("scrolled");

        }

        window.addEventListener("scroll", scrollHandler);

        return () => window.removeEventListener("scroll", scrollHandler);
    },[])

  return (
    <div className="pb-20 px-4">
        <div className="container ms-auto text-center">
            <h1 className="text-5xl md:text-8xl lg:text-[105px] pb-6 gradient-title">
                Manage Your Finances <br/> with Intelligence
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                An AI-powered financial management platform that helps you track your money, analyze and plan your budget with real-time insights.
            </p>
            <div className='flex justify-center space-x-2'>
                <Link href="/dashboard">
                    <Button size="lg" className="px-8">
                        Get Started
                    </Button>
                </Link>
            </div>

            <div className='hero-image-wrapper'>
                <div ref={imageRef} className='hero-image'>
                    <Image 
                        src="/banner.jpeg" 
                        alt="Dashboard Preview" 
                        width={1280} height={720} 
                        className="rounded-lg shadow-2xl border mx-auto w-[1280px] h-[720px]" 
                        priority
                    />
                </div>
            </div>
        </div>
    </div>
  )
}

export default HeroSection