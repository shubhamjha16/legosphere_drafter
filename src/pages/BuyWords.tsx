import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const BuyWords = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </Link>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                    ⚡
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Upgrade Your Plan</h1>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Get more words to continue drafting and researching with AI. Choose a plan that suits your needs.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    {[
                        { name: 'Starter', price: '$29', words: '100,000 words' },
                        { name: 'Pro', price: '$79', words: '500,000 words', popular: true },
                        { name: 'Enterprise', price: '$199', words: 'Unlimited words' },
                    ].map((plan, i) => (
                        <div key={i} className={`relative p-6 rounded-xl border ${plan.popular ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'} hover:border-primary transition-colors cursor-pointer`}>
                            {plan.popular && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                                    Most Popular
                                </span>
                            )}
                            <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                            <div className="mt-2 mb-4">
                                <span className="text-3xl font-bold">{plan.price}</span>
                                <span className="text-gray-500">/month</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-6">{plan.words}</p>
                            <button className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${plan.popular ? 'bg-primary text-white hover:bg-primary/90' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                                Choose Plan
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BuyWords;
