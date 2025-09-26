import React, { useMemo, useState } from 'react'

export function CategoryTreeMultiSelect({
    categories = [],
    tree = [],
    value = [],
    onChange,
    disabled = false,
    error = null,
    placeholder = "Select categories..."
}) {
    const [expandedNodes, setExpandedNodes] = useState(new Set())
    const [searchTerm, setSearchTerm] = useState('')

    // Convert value to Set for easier checking
    const selectedCategories = useMemo(() => new Set(value.map(String)), [value])

    // Flatten tree for search functionality
    const flattenTree = (nodes, result = []) => {
        nodes.forEach(node => {
            result.push(node)
            if (node.children && node.children.length > 0) {
                flattenTree(node.children, result)
            }
        })
        return result
    }

    // Filter tree based on search term
    const filteredTree = useMemo(() => {
        if (!searchTerm.trim()) {
            return tree
        }

        const allNodes = flattenTree(tree)
        const matchingNodes = allNodes.filter(node =>
            node.name.toLowerCase().includes(searchTerm.toLowerCase())
        )

        // Build filtered tree with matching nodes and their parents
        const filteredNodes = new Set()
        matchingNodes.forEach(node => {
            // Add the matching node
            filteredNodes.add(node.id)

            // Add all parent nodes
            let current = node
            while (current.parentId) {
                const parent = allNodes.find(n => n.id === current.parentId)
                if (parent) {
                    filteredNodes.add(parent.id)
                    current = parent
                } else {
                    break
                }
            }
        })

        // Build filtered tree structure
        const buildFilteredTree = (nodes) => {
            return nodes.filter(node => {
                const hasMatchingDescendant = (node) => {
                    if (filteredNodes.has(node.id)) return true
                    if (node.children) {
                        return node.children.some(child => hasMatchingDescendant(child))
                    }
                    return false
                }
                return hasMatchingDescendant(node)
            }).map(node => ({
                ...node,
                children: node.children ? buildFilteredTree(node.children) : []
            }))
        }

        return buildFilteredTree(tree)
    }, [tree, searchTerm])

    const toggleExpanded = (nodeId) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev)
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId)
            } else {
                newSet.add(nodeId)
            }
            return newSet
        })
    }

    const handleNodeClick = (nodeId) => {
        if (disabled) return

        const nodeIdStr = String(nodeId)
        const newSelected = new Set(selectedCategories)

        if (newSelected.has(nodeIdStr)) {
            newSelected.delete(nodeIdStr)
        } else {
            newSelected.add(nodeIdStr)
        }

        if (onChange) {
            onChange(Array.from(newSelected).map(Number))
        }
    }

    const handleClearSelection = () => {
        if (onChange) {
            onChange([])
        }
    }

    const handleSelectAll = () => {
        if (disabled) return

        const allNodeIds = flattenTree(tree).map(node => node.id)
        if (onChange) {
            onChange(allNodeIds)
        }
    }

    const renderTreeNode = (node, level = 0) => {
        const isExpanded = expandedNodes.has(node.id)
        const hasChildren = node.children && node.children.length > 0
        const isSelected = selectedCategories.has(String(node.id))

        return (
            <div key={node.id} className="category-tree-node">
                <div
                    className={`flex items-center py-2 px-3 hover:bg-gray-50 transition-colors duration-200 ${isSelected ? 'bg-orange-50 border-l-4 border-orange-500' : ''
                        }`}
                    style={{ paddingLeft: `${level * 24 + 12}px` }}
                >
                    {hasChildren && (
                        <button
                            type="button"
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 rounded mr-2"
                            onClick={() => toggleExpanded(node.id)}
                            disabled={disabled}
                        >
                            <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} text-xs`}></i>
                        </button>
                    )}
                    {!hasChildren && <div className="w-6 mr-2"></div>}

                    <div
                        className="flex items-center flex-1 cursor-pointer"
                        onClick={() => handleNodeClick(node.id)}
                    >
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                                checked={isSelected}
                                onChange={() => handleNodeClick(node.id)}
                                disabled={disabled}
                            />
                        </div>
                        <div className="ml-3 flex items-center">
                            <i className={`fas fa-folder mr-2 text-orange-500 ${isSelected ? 'text-orange-600' : ''}`}></i>
                            <span className={`text-sm font-medium ${isSelected ? 'text-orange-900' : 'text-gray-900'}`}>
                                {node.name}
                            </span>
                        </div>
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div className="category-tree-children">
                        {node.children.map(child => renderTreeNode(child, level + 1))}
                    </div>
                )}
            </div>
        )
    }

    const selectedCount = selectedCategories.size
    const totalCount = flattenTree(tree).length

    return (
        <div className="category-tree-multiselect bg-white border border-gray-200 rounded-lg shadow-sm">
            {/* Search Section */}
            <div className="p-4 border-b border-gray-200">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-search text-gray-400"></i>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={disabled}
                    />
                </div>
            </div>

            {/* Tree Header with Actions */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <i className="fas fa-info-circle text-orange-500 mr-2"></i>
                        <span className="text-sm text-gray-600">
                            {selectedCount > 0 ? `${selectedCount} of ${totalCount} categories selected` : 'Select categories:'}
                        </span>
                    </div>
                    <div className="flex space-x-2">
                        {selectedCount > 0 && (
                            <button
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                onClick={handleClearSelection}
                                disabled={disabled}
                            >
                                <i className="fas fa-times mr-1"></i>
                                Clear All
                            </button>
                        )}
                        {totalCount > 0 && selectedCount < totalCount && (
                            <button
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-300 rounded-lg hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                onClick={handleSelectAll}
                                disabled={disabled}
                            >
                                <i className="fas fa-check-double mr-1"></i>
                                Select All
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tree Container */}
            <div className="tree-container">
                {/* Tree List */}
                <div className={`max-h-80 overflow-y-auto ${error ? 'border-red-300' : ''}`}>
                    {filteredTree.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <i className="fas fa-folder-open text-2xl text-gray-400"></i>
                            </div>
                            <div className="text-sm font-medium text-gray-600 mb-1">
                                {searchTerm ? 'No categories match your search' : 'No categories available'}
                            </div>
                            <div className="text-xs text-gray-500">
                                {searchTerm ? 'Try adjusting your search terms' : 'Categories will appear here when available'}
                            </div>
                        </div>
                    ) : (
                        <div className="category-tree-list">
                            {filteredTree.map(node => renderTreeNode(node))}
                        </div>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="px-4 py-3 bg-red-50 border-t border-red-200">
                    <div className="flex items-center">
                        <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                        <span className="text-sm text-red-700">{error}</span>
                    </div>
                </div>
            )}

            {/* Selected Categories Summary */}
            {selectedCount > 0 && (
                <div className="px-4 py-3 bg-orange-50 border-t border-orange-200">
                    <div className="flex items-start">
                        <i className="fas fa-check-circle text-orange-500 mr-2 mt-0.5"></i>
                        <div>
                            <div className="text-sm font-medium text-orange-800 mb-1">
                                Selected Categories ({selectedCount})
                            </div>
                            <div className="text-xs text-orange-700">
                                {Array.from(selectedCategories).map(id => {
                                    const category = flattenTree(tree).find(cat => String(cat.id) === id)
                                    return category ? category.name : id
                                }).join(', ')}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
