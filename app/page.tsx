import Link from 'next/link';

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col items-center justify-center p-8">
            <div className="max-w-5xl w-full space-y-12">

                {/* Hero */}
                <header className="text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-orange-500/20 mx-auto mb-2">
                        DW
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                        DesignWear
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 text-3xl md:text-4xl mt-1">
                            Backend Platform
                        </span>
                    </h1>
                    <p className="text-gray-400 text-base max-w-lg mx-auto leading-relaxed">
                        Central management hub — products, orders, inventory, customers, and custom design templates.
                    </p>
                </header>

                {/* Feature cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/designwear-studio"
                        className="group bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-orange-500/40 p-6 rounded-2xl transition-all duration-200 cursor-pointer"
                    >
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-black text-base mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/20">
                            S
                        </div>
                        <h2 className="text-white font-bold text-lg mb-1.5">Sanity Studio</h2>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Full CMS for catalog, orders, customers, and inventory. Publishes to Firebase on save.
                        </p>
                        <div className="mt-4 text-orange-400 text-sm font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                            Open Studio →
                        </div>
                    </Link>

                    <div className="bg-white/[0.04] border border-white/10 p-6 rounded-2xl">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-black text-base mb-5 shadow-lg shadow-green-500/20">
                            A
                        </div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <h2 className="text-white font-bold text-lg">Backend API</h2>
                            <span className="text-xs bg-green-500/15 text-green-400 border border-green-500/25 px-2 py-0.5 rounded-full font-medium">
                                Live
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Firebase-integrated REST API serving the DesignWear Flutter app with real-time sync.
                        </p>
                        <code className="mt-4 block text-xs text-gray-500 bg-white/[0.04] rounded-lg px-3 py-2 font-mono border border-white/5">
                            /api/products · /api/orders
                        </code>
                    </div>

                    <div className="bg-white/[0.04] border border-white/10 p-6 rounded-2xl">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-black text-base mb-5 shadow-lg shadow-blue-500/20">
                            DS
                        </div>
                        <h2 className="text-white font-bold text-lg mb-1.5">Design Studio</h2>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Customer-facing customisation canvas built into the Flutter mobile app.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {['T-Shirts', 'Hoodies', 'Caps', 'Tote Bags'].map((item) => (
                                <span
                                    key={item}
                                    className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick links */}
                <div className="border-t border-white/[0.08] pt-6 flex flex-wrap gap-x-5 gap-y-2 justify-center text-sm">
                    {[
                        { href: '/designwear-studio/structure/product',          label: 'Products'   },
                        { href: '/designwear-studio/structure/order',             label: 'Orders'     },
                        { href: '/designwear-studio/structure/customer',          label: 'Customers'  },
                        { href: '/designwear-studio/structure/inventoryMovement', label: 'Inventory'  },
                        { href: '/designwear-studio/vision',                      label: 'GROQ Vision'},
                    ].map(({ href, label }) => (
                        <Link key={href} href={href} className="text-gray-500 hover:text-white transition-colors">
                            {label}
                        </Link>
                    ))}
                </div>

            </div>
        </div>
    );
}
