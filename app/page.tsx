export default function Home() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
            <div className="max-w-4xl w-full">
                <header className="mb-12 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                        DesignWear <span className="text-blue-600">Platform</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl">
                        Welcome to the central management hub for DesignWear. Navigate to the CMS Studio below.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                    <a href="/designwear-studio" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all cursor-pointer group">
                        <div className="w-12 h-12 rounded-xl bg-orange-500 mb-6 opacity-90 flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
                            S
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Sanity Studio</h2>
                        <p className="text-gray-500 text-sm leading-relaxed">Manage your catalog schemas, inventory items, and CMS assets.</p>
                    </a>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 opacity-60">
                        <div className="w-12 h-12 rounded-xl bg-green-500 mb-6 flex items-center justify-center text-white font-bold text-xl">
                            A
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Node API <span className="text-xs ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full">Running</span></h2>
                        <p className="text-gray-500 text-sm leading-relaxed">Firebase integrated backend serving data on <code className="bg-gray-100 rounded px-1">localhost:3001</code></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
