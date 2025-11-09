import React from 'react';

const CategoryNav = ({ activeCategory, setActiveCategory }) => {

    const categories = [
        { id: 'all', label: 'ALL' },
        { id: 'appetizers', label: 'APPETIZERS' },
        { id: 'main-courses', label: 'MAIN COURSES' },
        { id: 'side-dishes', label: 'SIDE DISHES' },
        { id: 'desserts', label: 'DESSERTS' },
        { id: 'soups-salads', label: 'SOUPS & SALADS' },
        { id: 'beverages', label: 'BEVERAGES' },
        { id: 'snacks', label: 'SNACKS' },
        { id: 'vegetarian', label: 'VEGETARIAN' }
    ];

    return (
        <div className="w-full overflow-x-auto no-scrollbar mb-8">
            <div className="flex justify-center gap-4 p-2">
                {categories.map(category => (
                    <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap
              ${activeCategory === category.id
                            ? 'bg-orange-100 text-orange-500'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}

                    >
                        {category.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryNav;