import React from 'react'
import { GlassCard } from './GlassCard'

export const Commit = () => {
  return (
    <GlassCard className="text-white flex-1 min-h-[180px]">
            <div className="font-semibold text-lg mb-4">15 Commit to review</div>
            <ul className="space-y-2">
              {[1,2,3].map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#13ff8c] inline-block"></span>
                  <span className="text-sm">Commit message {i}</span>
                </li>
              ))}
            </ul>
    </GlassCard>
  )
}
