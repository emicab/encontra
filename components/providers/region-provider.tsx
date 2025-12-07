"use client"

import React, { createContext, useContext } from 'react'

const RegionContext = createContext<string | null>(null)

export function RegionProvider({
    children,
    regionCode
}: {
    children: React.ReactNode
    regionCode: string | null
}) {
    return (
        <RegionContext.Provider value={regionCode}>
            {children}
        </RegionContext.Provider>
    )
}

export function useRegion() {
    return useContext(RegionContext)
}
