import React, { useEffect, useMemo, useState } from 'react'

export function CategoryTreeSelector({
    categories = [],
    tree = [],
    hierarchy = [],
    value = '',
    onChange,
    disabled = false,
    error = null,
    editingCategoryId = null
}) {
    const [expandedNodes, setExpandedNodes] = useState(new Set())
    const [searchTerm, setSearchTerm] = useState('')

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
            return nodes.map(node => {
                const hasMatchingChildren = node.children && node.children.some(child =>
                    filteredNodes.has(child.id) || buildFilteredTree([child]).length > 0
                )

                if (filteredNodes.has(node.id) || hasMatchingChildren) {
                    return {
                        ...node,
                        children: node.children ? buildFilteredTree(node.children) : []
                    }
                }
                return null
            }).filter(Boolean)
        }

        return buildFilteredTree(tree)
    }, [tree, searchTerm])

    // Auto-expand nodes when searching
    useEffect(() => {
        if (searchTerm.trim()) {
            const newExpanded = new Set()
            const allNodes = flattenTree(tree)

            allNodes.forEach(node => {
                if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                    // Expand parent nodes
                    let current = node
                    while (current.parentId) {
                        const parent = allNodes.find(n => n.id === current.parentId)
                        if (parent) {
                            newExpanded.add(parent.id)
                            current = parent
                        } else {
                            break
                        }
                    }
                }
            })
            setExpandedNodes(newExpanded)
        }
    }, [searchTerm, tree])

    const toggleExpanded = (nodeId) => {
        const newExpanded = new Set(expandedNodes)
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId)
        } else {
            newExpanded.add(nodeId)
        }
        setExpandedNodes(newExpanded)
    }

    const handleNodeClick = (nodeId) => {
        if (onChange) {
            onChange(String(nodeId))
        }
    }

    const handleClearSelection = () => {
        if (onChange) {
            onChange('')
        }
    }

    const renderTreeNode = (node, level = 0) => {
        const isExpanded = expandedNodes.has(node.id)
        const hasChildren = node.children && node.children.length > 0
        const isSelected = value === String(node.id)
        const isDisabled = node.disabled || (editingCategoryId && node.id === editingCategoryId)

        return (
            <div key={node.id} className="tree-node">
                <div
                    className={`tree-node-content ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                    style={{ paddingLeft: `${level * 20 + 8}px` }}
                >
                    {hasChildren && (
                        <button
                            type="button"
                            className="tree-toggle"
                            onClick={() => toggleExpanded(node.id)}
                            disabled={isDisabled}
                        >
                            <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
                        </button>
                    )}
                    {!hasChildren && <span className="tree-spacer"></span>}

                    <div
                        className={`tree-label ${isDisabled ? 'text-muted' : 'clickable'}`}
                        onClick={() => !isDisabled && handleNodeClick(node.id)}
                    >
                        <i className="fas fa-folder mr-2"></i>
                        {node.name}
                        {isSelected && <i className="fas fa-check text-success ml-2"></i>}
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

    return (
        <div className="category-tree-selector">
            <div className="tree-search mb-2">
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
                    <small className="text-gray-500">Select parent category:</small>
                    <button
                        type="button"
                        className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleClearSelection}
                        disabled={disabled || !value}
                    >
                        <i className="fas fa-times mr-1"></i>
                        Clear
                    </button>
                </div>

                <div className={`tree-list ${error ? 'border-red-300' : ''}`}>
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

            <style jsx>{`
        .category-tree-selector {
          border: 1px solid #dee2e6;
          border-radius: 0.375rem;
          background: #fff;
        }

        .tree-search {
          border-bottom: 1px solid #dee2e6;
          padding: 0.75rem;
        }

        .tree-container {
          padding: 0.75rem;
          max-height: 300px;
          overflow-y: auto;
        }

        .tree-list {
          border: 1px solid #dee2e6;
          border-radius: 0.25rem;
          background: #f8f9fa;
          min-height: 120px;
        }

        .tree-node-content {
          display: flex;
          align-items: center;
          padding: 0.25rem 0;
          border-bottom: 1px solid #e9ecef;
          transition: background-color 0.15s ease-in-out;
        }

        .tree-node-content:hover:not(.disabled) {
          background-color: #e9ecef;
        }

        .tree-node-content.selected {
          background-color: #cce5ff;
          border-color: #007bff;
        }

        .tree-node-content.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .tree-toggle {
          background: none;
          border: none;
          padding: 0.125rem 0.25rem;
          margin-right: 0.25rem;
          cursor: pointer;
          color: #6c757d;
          font-size: 0.75rem;
        }

        .tree-toggle:hover {
          color: #495057;
        }

        .tree-toggle:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .tree-spacer {
          width: 1.5rem;
          height: 1rem;
        }

        .tree-label {
          display: flex;
          align-items: center;
          flex: 1;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }

        .tree-label.clickable {
          cursor: pointer;
        }

        .tree-label.clickable:hover {
          background-color: rgba(0, 123, 255, 0.1);
        }

        .tree-children {
          border-left: 2px solid #dee2e6;
          margin-left: 1rem;
        }

        .tree-list::-webkit-scrollbar {
          width: 6px;
        }

        .tree-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .tree-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .tree-list::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
        </div>
    )
}
