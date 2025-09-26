import React from 'react';

export function StorageBreadcrumb({ currentDirectoryId, breadcrumb, onNavigate }) {
    return (
        <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
                <li className={`breadcrumb-item ${currentDirectoryId === null ? 'active' : ''}`}>
                    {currentDirectoryId === null ? 'Root' : (
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(null) }}>
                            Root
                        </a>
                    )}
                </li>
                {breadcrumb.map((crumb) => (
                    <li key={crumb.id} className={`breadcrumb-item ${crumb.id === currentDirectoryId ? 'active' : ''}`}>
                        {crumb.id === currentDirectoryId ? crumb.name : (
                            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(crumb.id) }}>
                                {crumb.name}
                            </a>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    )
}

