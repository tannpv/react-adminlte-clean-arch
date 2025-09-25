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
            <div key={node.id} className="tree-node">
                <div
                    className={`tree-node-content ${isSelected ? 'selected' : ''}`}
                    style={{ paddingLeft: `${level * 20 + 8}px` }}
                >
                    {hasChildren && (
                        <button
                            type="button"
                            className="tree-toggle"
                            onClick={() => toggleExpanded(node.id)}
                            disabled={disabled}
                        >
                            <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
                        </button>
                    )}
                    {!hasChildren && <span className="tree-spacer"></span>}

                    <div
                        className={`tree-label clickable`}
                        onClick={() => handleNodeClick(node.id)}
                    >
                        <div className="custom-control custom-checkbox d-inline-block mr-2">
                            <input
                                type="checkbox"
                                className="custom-control-input"
                                checked={isSelected}
                                onChange={() => handleNodeClick(node.id)}
                                disabled={disabled}
                            />
                            <label className="custom-control-label"></label>
                        </div>
                        <i className="fas fa-folder mr-2"></i>
                        {node.name}
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div className="tree-children">
                        {node.children.map(child => renderTreeNode(child, level + 1))}
                    </div>
                )}
            </div>
        )
    }

    const selectedCount = selectedCategories.size
    const totalCount = flattenTree(tree).length

    return (
        <div className="category-tree-multiselect">
            <div className="search-container mb-3">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-search text-gray-400"></i>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={disabled}
                    />
                </div>
            </div>

            <div className="tree-container">
                <div className="tree-header flex justify-between items-center mb-2">
                    <small className="text-gray-500">
                        {selectedCount > 0 ? `${selectedCount} of ${totalCount} categories selected` : 'Select categories:'}
                    </small>
                    <div className="tree-actions">
                        {selectedCount > 0 && (
                            <button
                                type="button"
                                className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed mr-2"
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
                                className="px-2 py-1 text-xs border border-blue-300 rounded text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleSelectAll}
                                disabled={disabled}
                            >
                                <i className="fas fa-check-double mr-1"></i>
                                Select All
                            </button>
                        )}
                    </div>
                </div>

                <div className={`tree-list ${error ? 'border-red-300' : ''}`} style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {filteredTree.length === 0 ? (
                        <div className="text-gray-500 text-center py-3">
                            <i className="fas fa-folder-open fa-2x mb-2"></i>
                            <div>{searchTerm ? 'No categories match your search' : 'No categories available'}</div>
                        </div>
                    ) : (
                        filteredTree.map(node => renderTreeNode(node))
                    )}
                </div>

                {error && <div className="invalid-feedback d-block">{error}</div>}
            </div>

            {/* Selected Categories Summary */}
            {selectedCount > 0 && (
                <div className="selected-summary mt-3">
                    <small className="text-muted">
                        <i className="fas fa-check-circle mr-1"></i>
                        Selected: {Array.from(selectedCategories).map(id => {
                            const category = flattenTree(tree).find(cat => String(cat.id) === id)
                            return category ? category.name : id
                        }).join(', ')}
                    </small>
                </div>
            )}
        </div>
    )
}
