import { useEffect, useState } from 'react'

export function useCategorySearch({ debounceMs = 300 } = {}) {
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedTerm, setDebouncedTerm] = useState('')

    useEffect(() => {
        const handle = setTimeout(() => {
            setDebouncedTerm(searchTerm.trim())
        }, debounceMs)

        return () => clearTimeout(handle)
    }, [debounceMs, searchTerm])

    return {
        searchTerm,
        setSearchTerm,
        debouncedTerm,
    }
}
