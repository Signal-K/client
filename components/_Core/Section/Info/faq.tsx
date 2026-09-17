import Link from "next/link";

export default function InfoFAQ () {

    return (
        <section className="bg-white dark:bg-gray-900">
        <div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
            <h2 className="mb-8 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">Frequently asked questions</h2>
            <div className="grid pt-8 text-left border-t border-gray-200 md:gap-16 dark:border-gray-700 md:grid-cols-2">
                <div>
                    <div className="mb-10">
                        <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-white">
                            <svg className="flex-shrink-0 mr-2 w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path></svg>
                            Where can I get help or more information?
                        </h3>
                        <Link legacyBehavior href ='https://discord.gg/NQBKGrQuUX'><p className="text-gray-500 dark:text-gray-400">We've got a page with some different tutorials on what to look for, and a discord server (click here) to compare results, discuss findings & get help</p></Link>
                    </div>
                </div>
                <div>
                    <div className="mb-10">                        
                        <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-white">
                            <svg className="flex-shrink-0 mr-2 w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path></svg>
                            ChatGPT exists. What benefit can I have on scientific research?
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {/* Citizen science is still crucial in classifying planetary candidates, even with the advancements in AI technology like ChatGPT. One reason is that citizen scientists provide a diversity of perspectives and ideas that are not always captured by AI algorithms. They can also help identify patterns or anomalies that may be overlooked by machines, or flag false positives that could otherwise lead to inaccurate results. Additionally, involving citizen scientists in scientific research promotes education and engagement in science, technology, engineering, and mathematics (STEM) fields. It allows individuals who may not have formal training in these areas to contribute to scientific discoveries and feel more connected to the scientific community. Ultimately, citizen science can provide a powerful tool for scientists to explore the universe and expand our knowledge of the cosmos.</p> */}
                            {/* Citizen science remains important in classifying planetary candidates, despite advancements in AI like ChatGPT. Citizen scientists offer diverse perspectives and ideas that machines may not capture. They can identify patterns or anomalies overlooked by machines and flag false positives that could lead to inaccurate results. Citizen science promotes education and engagement in STEM fields and allows individuals without formal training to contribute to scientific discoveries. It is a powerful tool for scientists to explore the universe and expand our knowledge of the cosmos. </p> */}
                            Citizen science remains important in the classification of planetary candidates, despite the development of AI technology such as ChatGPT. Citizen scientists provide unique perspectives, flag false positives, and engage more people in STEM fields, ultimately expanding our knowledge of the universe. </p>
                    </div>
                </div>
                <div>
                    <div className="mb-10">                        
                        <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-white">
                            <svg className="flex-shrink-0 mr-2 w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path></svg>
                            This is cool, but it's not quite a game...
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            That's right. Since 2021, we've been working on a beautiful game for Star Sailors in Unity3D, however due to regular burnout and a lack of funding, we've decided to release this web client first as a "proof of concept". We're adding new features daily and we're hoping to have a great game in your hands soon. And even before we get to that point, you'll be able to get a head start here, as you'll be able to own planets, generate resources and more - and your progress will be saved and migrated over to the full game upon release. </p>
                    </div>
                </div>
            </div>
        </div>
        </section>
    );
}