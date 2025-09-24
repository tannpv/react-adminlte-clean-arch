import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout = ({ children, menu, setMenu }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="flex">
                <Sidebar menu={menu} setMenu={setMenu} />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
