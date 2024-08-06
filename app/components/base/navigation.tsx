import Link from 'next/link';

export const Navbar = () => {
    return (
        <header className="bg-white shadow">
            <div className="container mx-auto flex justify-between items-center py-4 px-6">
                <div className="flex items-center">
                    <Link legacyBehavior href="/">
                        <a className="text-2xl font-bold text-gray-800">VEED.IO</a>
                    </Link>
                </div>
                <nav className="flex items-center space-x-6">
                    <Link legacyBehavior href="/tools">
                        <a className="text-gray-600 hover:text-gray-800">Tools</a>
                    </Link>
                    <Link legacyBehavior href="/pricing">
                        <a className="text-gray-600 hover:text-gray-800">Pricing</a>
                    </Link>
                    <Link legacyBehavior href="/guide-center">
                        <a className="text-gray-600 hover:text-gray-800">Guide Center</a>
                    </Link>
                </nav>
            </div>
        </header>
    );
};

const HomePage = () => {
    return (
        <div>
            <Navbar />
            <main className="container mx-auto py-10">
                {/* Your main content goes here */}
                <h1 className="text-4xl font-bold">Welcome to VEED.IO</h1>
                <p className="mt-4 text-lg">Explore our tools and features.</p>
            </main>
        </div>
    );
};

export default HomePage;
