<div style={{width: '100%', height: '100%', padding: 40, background: '#141417', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 32, display: 'inline-flex'}}>
    <div style={{width: 600, padding: 24, background: '#252528', overflow: 'hidden', borderRadius: 12, outline: '1px #4D4D52 solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
        <div style={{color: '#DEDEE0', fontSize: 16, fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word'}}>Checkbox state taxonomy + Safety Cover</div>
        <div style={{width: 10, height: 4, position: 'relative'}} />
        <div style={{width: 552, color: '#9999A1', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', lineHeight: 16, wordWrap: 'break-word'}}>Base classes: Normal → Inherited → Locked → Disabled. Compound rows (Disabled+Inherited, Disabled+Locked) show how Disabled composes orthogonally with the cascade class. SUB cascade is SYMMETRIC — SUB=OFF on an ancestor locks both ON and OFF values in descendants. Only Normal ON and Inherited ON carry accent — every OFF and every grey-tier cell is pure neutral.</div>
        <div style={{width: 10, height: 16, position: 'relative'}} />
        <div style={{width: 552, paddingTop: 6, paddingBottom: 6, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
                <div style={{color: '#9999A1', fontSize: 10, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>ON</div>
            </div>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
                <div style={{color: '#9999A1', fontSize: 10, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>OFF</div>
            </div>
            <div style={{width: 180, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
                <div style={{color: '#9999A1', fontSize: 10, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>CLASS</div>
            </div>
            <div style={{width: 260, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
                <div style={{color: '#9999A1', fontSize: 10, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>MEANING</div>
            </div>
        </div>
        <div style={{width: 552, height: 1, background: '#4D4D52'}} />
        <div style={{width: 552, paddingTop: 10, paddingBottom: 10, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{width: 14, height: 14, background: '#1478F2', overflow: 'hidden', borderRadius: 3, outline: '1px #1478F2 solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                    <div style={{color: 'white', fontSize: 10, fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word'}}>✓</div>
                </div>
            </div>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{width: 14, height: 14, position: 'relative', borderRadius: 3, border: '1px #D7D7DA solid'}} />
            </div>
            <div style={{width: 180, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{color: '#DEDEE0', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Normal</div>
            </div>
            <div style={{width: 260, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{width: 260, color: '#9999A1', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', lineHeight: 15, wordWrap: 'break-word'}}>User explicitly set this cell. Full-saturation accent on ON; neutral bright stroke on OFF. Wins over ancestor — any cascade from above stops here.</div>
            </div>
        </div>
        <div style={{width: 552, height: 1, background: 'rgba(76.50, 76.50, 81.60, 0.50)'}} />
        <div style={{width: 552, paddingTop: 10, paddingBottom: 10, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{width: 14, height: 14, background: '#1F426E', overflow: 'hidden', borderRadius: 3, outline: '1px #1E4A83 solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                    <div style={{color: 'white', fontSize: 9, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>✓</div>
                </div>
            </div>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{width: 14, height: 14, position: 'relative', borderRadius: 3, border: '1px #7C7C83 solid'}} />
            </div>
            <div style={{width: 180, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{color: '#DEDEE0', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Inherited</div>
            </div>
            <div style={{width: 260, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{width: 260, color: '#9999A1', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', lineHeight: 15, wordWrap: 'break-word'}}>Value flows from nearest ancestor override. Dim accent on ON, neutral dim stroke on OFF. Clickable — click promotes this cell to Normal (pins the value here, breaks further inheritance).</div>
            </div>
        </div>
        <div style={{width: 552, height: 1, background: 'rgba(76.50, 76.50, 81.60, 0.50)'}} />
        <div style={{width: 552, paddingTop: 10, paddingBottom: 10, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{width: 14, height: 14, background: '#4B4B4E', overflow: 'hidden', borderRadius: 3, outline: '1px #7C7C83 solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                    <div style={{color: '#AFAFB1', fontSize: 9, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>✓</div>
                </div>
            </div>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{width: 14, height: 14, position: 'relative', background: '#4B4B4E', borderRadius: 3, border: '1px #7C7C83 solid'}} />
            </div>
            <div style={{width: 180, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{color: '#DEDEE0', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Locked</div>
            </div>
            <div style={{width: 260, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{width: 260, color: '#9999A1', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', lineHeight: 15, wordWrap: 'break-word'}}>Value forced by cascade-lock source (SUB=OFF on an ancestor). Neutral grey — no accent tint. OFF has a subtle backing («крышечка»), distinguishing Locked OFF from Inherited OFF (empty) and Disabled OFF (dashed). Not clickable — unlock only at the source.</div>
            </div>
        </div>
        <div style={{width: 552, height: 1, background: 'rgba(76.50, 76.50, 81.60, 0.50)'}} />
        <div style={{width: 552, paddingTop: 10, paddingBottom: 10, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{width: 14, height: 14, overflow: 'hidden', borderRadius: 3, outline: '1px #7C7C83 solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                    <div style={{color: '#7C7C83', fontSize: 9, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>✓</div>
                </div>
            </div>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{width: 14, height: 14, position: 'relative', borderRadius: 3, border: '1px #7C7C83 solid'}} />
            </div>
            <div style={{width: 180, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{color: '#DEDEE0', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Disabled (row off)</div>
            </div>
            <div style={{width: 260, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{width: 260, color: '#9999A1', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', lineHeight: 15, wordWrap: 'break-word'}}>Row is functionally off — media missing or scan running. Dashed border + no backing in both states. Clicks are still accepted and mutate stored state — the change just has no real-world effect until the row re-enables. Safety Cover applies here specifically to remind the user they&apos;re touching something while the row is dead.</div>
            </div>
        </div>
        <div style={{width: 552, height: 1, background: 'rgba(76.50, 76.50, 81.60, 0.50)'}} />
        <div style={{width: 552, paddingTop: 10, paddingBottom: 10, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{width: 14, height: 14, overflow: 'hidden', borderRadius: 3, outline: '1px #4B4B4E solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                    <div style={{color: '#4B4B4E', fontSize: 9, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>✓</div>
                </div>
            </div>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{width: 14, height: 14, position: 'relative', borderRadius: 3, border: '1px #4B4B4E solid'}} />
            </div>
            <div style={{width: 180, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{color: '#DEDEE0', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Disabled + Inherited (row off)</div>
            </div>
            <div style={{width: 260, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{width: 260, color: '#9999A1', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', lineHeight: 15, wordWrap: 'break-word'}}>Row is off, and the stored value itself is Inherited from an ancestor. Dashed border (row-off signal) with a dim-accent check glyph on ON (lineage hint). Clicks are still accepted and mutate the cell&apos;s local override — when the row re-enables, that local override takes effect (promoting to Normal) if set.</div>
            </div>
        </div>
        <div style={{width: 552, height: 1, background: 'rgba(76.50, 76.50, 81.60, 0.50)'}} />
        <div style={{width: 552, paddingTop: 10, paddingBottom: 10, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{width: 14, height: 14, background: '#323234', overflow: 'hidden', borderRadius: 3, outline: '1px #4B4B4E solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                    <div style={{color: '#4B4B4E', fontSize: 9, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>✓</div>
                </div>
            </div>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{width: 14, height: 14, position: 'relative', background: '#323234', borderRadius: 3, border: '1px #4B4B4E solid'}} />
            </div>
            <div style={{width: 180, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{color: '#DEDEE0', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Disabled + Locked (row off)</div>
            </div>
            <div style={{width: 260, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{width: 260, color: '#9999A1', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', lineHeight: 15, wordWrap: 'break-word'}}>Row is off, and the stored value is cascade-locked from above. Dashed border with the grey Locked «подложка» peeking through. Not clickable even while the row is off — the Locked layer wins over the Disabled click-acceptance. No Safety Cover (nothing to gate).</div>
            </div>
        </div>
        <div style={{width: 552, height: 1, background: 'rgba(76.50, 76.50, 81.60, 0.50)'}} />
        <div style={{width: 552, paddingTop: 10, paddingBottom: 10, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{color: '#6B6B73', fontSize: 10, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>N/A</div>
            </div>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{overflow: 'hidden', justifyContent: 'center', alignItems: 'center', gap: 4, display: 'flex'}}>
                    <div style={{width: 12, height: 12, position: 'relative', overflow: 'hidden'}}>
                        <div style={{width: 12, height: 12, left: 0, top: 0, position: 'absolute', borderRadius: 3, border: '1.25px #4C4C51 solid'}} />
                        <div style={{width: 10, height: 10, left: 11, top: 11, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', outline: '1.25px #F55261 solid', outlineOffset: '-0.63px'}} />
                    </div>
                    <div style={{width: 12, height: 12, position: 'relative', overflow: 'hidden'}}>
                        <div style={{width: 12, height: 12, left: 0, top: 0, position: 'absolute', borderRadius: 3, border: '1.25px #4C4C51 solid'}} />
                        <div style={{width: 5, height: 10, left: 11, top: 11, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', outline: '1.25px #F55261 solid', outlineOffset: '-0.63px'}} />
                    </div>
                    <div style={{width: 12, height: 12, position: 'relative', overflow: 'hidden'}}>
                        <div style={{width: 12, height: 12, left: 0, top: 0, position: 'absolute', borderRadius: 3, border: '1.25px #4C4C51 solid'}} />
                        <div style={{width: 4.89, height: 1.36, left: 11, top: 2.36, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', outline: '1.25px #F55261 solid', outlineOffset: '-0.63px'}} />
                    </div>
                </div>
            </div>
            <div style={{width: 180, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{color: '#DEDEE0', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Safety Cover Countdown</div>
            </div>
            <div style={{width: 260, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{width: 260, color: '#9999A1', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', lineHeight: 15, wordWrap: 'break-word'}}>Orthogonal overlay — not a state class. Applies wherever the cell accepts clicks: Normal, Inherited, Disabled, Disabled+Inherited (4 of 6 rows above). Excluded from Locked and Disabled+Locked — source owns the value, so a 2-click gate has nothing to protect. Mechanic: first click arms (stroke turns red), countdown drains over ~3s, second click within the window commits. Timeout re-locks. Red appears ONLY during the armed countdown.</div>
            </div>
        </div>
        <div style={{width: 10, height: 16, position: 'relative'}} />
        <div style={{width: 552, height: 1, background: 'rgba(76.50, 76.50, 81.60, 0.80)'}} />
        <div style={{width: 10, height: 12, position: 'relative'}} />
        <div style={{width: 552, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{color: '#9999A1', fontSize: 10, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Design note</div>
            <div style={{width: 10, height: 6, position: 'relative'}} />
            <div style={{width: 552, color: '#9999A1', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', lineHeight: 16, wordWrap: 'break-word'}}>Works at 14px because distinguishing signals are structural (fill presence, dash pattern, backing), not glyph-based. Safety Cover is red-only during the armed window — activation signal, not column chrome. This keeps red desensitization-free: the user sees red only when something is about to happen.</div>
        </div>
    </div>
    <div style={{width: 600, padding: 24, background: '#252528', overflow: 'hidden', borderRadius: 12, outline: '1px #4D4D52 solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
        <div style={{color: '#DEDEE0', fontSize: 16, fontFamily: 'Inter', fontWeight: '700', wordWrap: 'break-word'}}>Eye state taxonomy + Safety Cover</div>
        <div style={{width: 10, height: 4, position: 'relative'}} />
        <div style={{width: 552, color: '#9999A1', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', lineHeight: 16, wordWrap: 'break-word'}}>Same base classes as the checkbox table (Normal / Inherited / Locked / Disabled + compounds), but ASYMMETRIC cascade: open eye = hard lock on descendants (no Inherited ON), closed eye = soft inherit (no Locked OFF). Forbidden (class, value) pairs render as a faded em-dash. Class signal has moved from the glyph itself to a 20×20 wrapper — transparent for Normal/Inherited (bare eye), painted for Locked/Disabled. Only Normal ON carries accent.</div>
        <div style={{width: 10, height: 16, position: 'relative'}} />
        <div style={{width: 552, paddingTop: 6, paddingBottom: 6, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
                <div style={{color: '#9999A1', fontSize: 10, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>ON</div>
            </div>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
                <div style={{color: '#9999A1', fontSize: 10, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>OFF</div>
            </div>
            <div style={{width: 180, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
                <div style={{color: '#9999A1', fontSize: 10, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>CLASS</div>
            </div>
            <div style={{width: 260, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
                <div style={{color: '#9999A1', fontSize: 10, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>MEANING</div>
            </div>
        </div>
        <div style={{width: 552, height: 1, background: '#4D4D52'}} />
        <div style={{width: 552, paddingTop: 10, paddingBottom: 10, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{width: 20, height: 20, overflow: 'hidden', borderRadius: 3, justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                    <div style={{width: 14, height: 14, position: 'relative', overflow: 'hidden'}}>
                        <div style={{width: 11.67, height: 8.17, left: 1.17, top: 2.92, position: 'absolute', outline: '1.17px #1478F2 solid', outlineOffset: '-0.58px'}} />
                        <div style={{width: 3.50, height: 3.50, left: 5.25, top: 5.25, position: 'absolute', outline: '1.17px #1478F2 solid', outlineOffset: '-0.58px'}} />
                    </div>
                </div>
            </div>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{width: 20, height: 20, overflow: 'hidden', borderRadius: 3, justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                    <div style={{width: 14, height: 14, position: 'relative', overflow: 'hidden'}}>
                        <div style={{width: 0.42, height: 1.90, left: 8.33, top: 8.60, position: 'absolute', outline: '1.17px #D7D7DA solid', outlineOffset: '-0.58px'}} />
                        <div style={{width: 11.67, height: 4.08, left: 1.17, top: 4.67, position: 'absolute', outline: '1.17px #D7D7DA solid', outlineOffset: '-0.58px'}} />
                        <div style={{width: 1.01, height: 1.20, left: 10.66, top: 7.55, position: 'absolute', outline: '1.17px #D7D7DA solid', outlineOffset: '-0.58px'}} />
                        <div style={{width: 1.01, height: 1.20, left: 2.33, top: 7.55, position: 'absolute', outline: '1.17px #D7D7DA solid', outlineOffset: '-0.58px'}} />
                        <div style={{width: 0.42, height: 1.90, left: 5.25, top: 8.60, position: 'absolute', outline: '1.17px #D7D7DA solid', outlineOffset: '-0.58px'}} />
                    </div>
                </div>
            </div>
            <div style={{width: 180, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{color: '#DEDEE0', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Normal</div>
            </div>
            <div style={{width: 260, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{width: 260, color: '#9999A1', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', lineHeight: 15, wordWrap: 'break-word'}}>User explicitly set eye state. Bare glyph — no container chrome. Full-saturation accent eye-open on ON; calm neutral borderStrong eye-closed on OFF. Wins over ancestor cascade.</div>
            </div>
        </div>
        <div style={{width: 552, height: 1, background: 'rgba(76.50, 76.50, 81.60, 0.50)'}} />
        <div style={{width: 552, paddingTop: 10, paddingBottom: 10, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{color: '#535358', fontSize: 12, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>—</div>
            </div>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{width: 20, height: 20, overflow: 'hidden', borderRadius: 3, justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                    <div style={{width: 14, height: 14, position: 'relative', overflow: 'hidden'}}>
                        <div style={{width: 0.42, height: 1.90, left: 8.33, top: 8.60, position: 'absolute', outline: '1.17px #7C7C83 solid', outlineOffset: '-0.58px'}} />
                        <div style={{width: 11.67, height: 4.08, left: 1.17, top: 4.67, position: 'absolute', outline: '1.17px #7C7C83 solid', outlineOffset: '-0.58px'}} />
                        <div style={{width: 1.01, height: 1.20, left: 10.66, top: 7.55, position: 'absolute', outline: '1.17px #7C7C83 solid', outlineOffset: '-0.58px'}} />
                        <div style={{width: 1.01, height: 1.20, left: 2.33, top: 7.55, position: 'absolute', outline: '1.17px #7C7C83 solid', outlineOffset: '-0.58px'}} />
                        <div style={{width: 0.42, height: 1.90, left: 5.25, top: 8.60, position: 'absolute', outline: '1.17px #7C7C83 solid', outlineOffset: '-0.58px'}} />
                    </div>
                </div>
            </div>
            <div style={{width: 180, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{color: '#DEDEE0', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Inherited</div>
            </div>
            <div style={{width: 260, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{width: 260, color: '#9999A1', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', lineHeight: 15, wordWrap: 'break-word'}}>Closed ancestor cascades as SOFT INHERIT — descendants echo closed, may individually override to open. Bare glyph, dim textDim eye-closed. Clickable — click promotes to Normal (the cell pins its own value). No ON variant: an open ancestor cascades as Locked ON, not Inherited ON.</div>
            </div>
        </div>
        <div style={{width: 552, height: 1, background: 'rgba(76.50, 76.50, 81.60, 0.50)'}} />
        <div style={{width: 552, paddingTop: 10, paddingBottom: 10, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{width: 14, height: 14, position: 'relative', overflow: 'hidden'}}>
                    <div style={{width: 11.67, height: 8.17, left: 1.17, top: 2.92, position: 'absolute', background: '#4B4B4E', outline: '1.17px #7C7C83 solid', outlineOffset: '-0.58px'}} />
                    <div style={{width: 3.50, height: 3.50, left: 5.25, top: 5.25, position: 'absolute', outline: '1.17px #7C7C83 solid', outlineOffset: '-0.58px'}} />
                </div>
            </div>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{color: '#535358', fontSize: 12, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>—</div>
            </div>
            <div style={{width: 180, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{color: '#DEDEE0', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Locked</div>
            </div>
            <div style={{width: 260, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{width: 260, color: '#9999A1', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', lineHeight: 15, wordWrap: 'break-word'}}>Open ancestor cascades as HARD LOCK — descendants are forced open. Glyph lives in a 20×20 wrapper with grey «подложка» fill. Not clickable — unlock only at the ancestor (toggle that eye closed). No OFF variant: a closed ancestor doesn&apos;t lock, so a closed eye is always Inherited or Normal, never Locked.</div>
            </div>
        </div>
        <div style={{width: 552, height: 1, background: 'rgba(76.50, 76.50, 81.60, 0.50)'}} />
        <div style={{width: 552, paddingTop: 10, paddingBottom: 10, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{width: 14, height: 14, position: 'relative', overflow: 'hidden'}}>
                    <div style={{width: 11.67, height: 8.17, left: 1.17, top: 2.92, position: 'absolute', outline: '1.17px #7C7C83 solid', outlineOffset: '-0.58px'}} />
                    <div style={{width: 3.50, height: 3.50, left: 5.25, top: 5.25, position: 'absolute', outline: '1.17px #7C7C83 solid', outlineOffset: '-0.58px'}} />
                </div>
            </div>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{width: 14, height: 14, position: 'relative', overflow: 'hidden'}}>
                    <div style={{width: 0.42, height: 1.90, left: 8.33, top: 8.60, position: 'absolute', outline: '1.17px #7C7C83 solid', outlineOffset: '-0.58px'}} />
                    <div style={{width: 11.67, height: 4.08, left: 1.17, top: 4.67, position: 'absolute', outline: '1.17px #7C7C83 solid', outlineOffset: '-0.58px'}} />
                    <div style={{width: 1.01, height: 1.20, left: 10.66, top: 7.55, position: 'absolute', outline: '1.17px #7C7C83 solid', outlineOffset: '-0.58px'}} />
                    <div style={{width: 1.01, height: 1.20, left: 2.33, top: 7.55, position: 'absolute', outline: '1.17px #7C7C83 solid', outlineOffset: '-0.58px'}} />
                    <div style={{width: 0.42, height: 1.90, left: 5.25, top: 8.60, position: 'absolute', outline: '1.17px #7C7C83 solid', outlineOffset: '-0.58px'}} />
                </div>
            </div>
            <div style={{width: 180, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{color: '#DEDEE0', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Disabled (row off)</div>
            </div>
            <div style={{width: 260, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{width: 260, color: '#9999A1', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', lineHeight: 15, wordWrap: 'break-word'}}>Row is functionally off — media missing or scan running. Dashed 20×20 wrapper, no fill, in both ON and OFF. Clicks are still accepted and mutate stored state — the change just has no real-world effect until the row re-enables. Safety Cover applies here specifically to remind the user they&apos;re touching something while the row is dead.</div>
            </div>
        </div>
        <div style={{width: 552, height: 1, background: 'rgba(76.50, 76.50, 81.60, 0.50)'}} />
        <div style={{width: 552, paddingTop: 10, paddingBottom: 10, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{color: '#535358', fontSize: 12, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>—</div>
            </div>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{width: 14, height: 14, position: 'relative', overflow: 'hidden'}}>
                    <div style={{width: 0.42, height: 1.90, left: 8.33, top: 8.60, position: 'absolute', outline: '1.17px #4B4B4E solid', outlineOffset: '-0.58px'}} />
                    <div style={{width: 11.67, height: 4.08, left: 1.17, top: 4.67, position: 'absolute', outline: '1.17px #4B4B4E solid', outlineOffset: '-0.58px'}} />
                    <div style={{width: 1.01, height: 1.20, left: 10.66, top: 7.55, position: 'absolute', outline: '1.17px #4B4B4E solid', outlineOffset: '-0.58px'}} />
                    <div style={{width: 1.01, height: 1.20, left: 2.33, top: 7.55, position: 'absolute', outline: '1.17px #4B4B4E solid', outlineOffset: '-0.58px'}} />
                    <div style={{width: 0.42, height: 1.90, left: 5.25, top: 8.60, position: 'absolute', outline: '1.17px #4B4B4E solid', outlineOffset: '-0.58px'}} />
                </div>
            </div>
            <div style={{width: 180, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{color: '#DEDEE0', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Disabled + Inherited (row off)</div>
            </div>
            <div style={{width: 260, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{width: 260, color: '#9999A1', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', lineHeight: 15, wordWrap: 'break-word'}}>Row is off, and the stored value itself is Inherited OFF from an ancestor. Dashed wrapper over the bare eye-closed glyph. Clicks are still accepted — they set a local override that will take effect when the row re-enables. ON variant doesn&apos;t exist for the same reason as plain Inherited ON.</div>
            </div>
        </div>
        <div style={{width: 552, height: 1, background: 'rgba(76.50, 76.50, 81.60, 0.50)'}} />
        <div style={{width: 552, paddingTop: 10, paddingBottom: 10, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{width: 14, height: 14, position: 'relative', overflow: 'hidden'}}>
                    <div style={{width: 11.67, height: 8.17, left: 1.17, top: 2.92, position: 'absolute', background: '#313134', outline: '1.17px #4B4B4E solid', outlineOffset: '-0.58px'}} />
                    <div style={{width: 3.50, height: 3.50, left: 5.25, top: 5.25, position: 'absolute', outline: '1.17px #4B4B4E solid', outlineOffset: '-0.58px'}} />
                </div>
            </div>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{color: '#535358', fontSize: 12, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>—</div>
            </div>
            <div style={{width: 180, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{color: '#DEDEE0', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Disabled + Locked (row off)</div>
            </div>
            <div style={{width: 260, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{width: 260, color: '#9999A1', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', lineHeight: 15, wordWrap: 'break-word'}}>Row is off, but the eye is also under cascade-lock from an open ancestor. Dashed wrapper with the grey Locked «подложка» peeking through. Not clickable even while the row is off — Locked wins over Disabled click-acceptance. No Safety Cover (nothing to gate). OFF variant doesn&apos;t exist for the same reason as plain Locked OFF.</div>
            </div>
        </div>
        <div style={{width: 552, height: 1, background: 'rgba(76.50, 76.50, 81.60, 0.50)'}} />
        <div style={{width: 552, paddingTop: 10, paddingBottom: 10, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{color: '#6B6B73', fontSize: 10, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>N/A</div>
            </div>
            <div style={{width: 48, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div style={{overflow: 'hidden', justifyContent: 'center', alignItems: 'center', gap: 4, display: 'flex'}}>
                    <div style={{width: 12, height: 12, position: 'relative', overflow: 'hidden'}}>
                        <div style={{width: 12, height: 12, left: 0, top: 0, position: 'absolute', borderRadius: 3, border: '1.25px #4C4C51 solid'}} />
                        <div style={{width: 10, height: 10, left: 11, top: 11, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', outline: '1.25px #F55261 solid', outlineOffset: '-0.63px'}} />
                    </div>
                    <div style={{width: 12, height: 12, position: 'relative', overflow: 'hidden'}}>
                        <div style={{width: 12, height: 12, left: 0, top: 0, position: 'absolute', borderRadius: 3, border: '1.25px #4C4C51 solid'}} />
                        <div style={{width: 5, height: 10, left: 11, top: 11, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', outline: '1.25px #F55261 solid', outlineOffset: '-0.63px'}} />
                    </div>
                    <div style={{width: 12, height: 12, position: 'relative', overflow: 'hidden'}}>
                        <div style={{width: 12, height: 12, left: 0, top: 0, position: 'absolute', borderRadius: 3, border: '1.25px #4C4C51 solid'}} />
                        <div style={{width: 4.89, height: 1.36, left: 11, top: 2.36, position: 'absolute', transform: 'rotate(180deg)', transformOrigin: 'top left', outline: '1.25px #F55261 solid', outlineOffset: '-0.63px'}} />
                    </div>
                </div>
            </div>
            <div style={{width: 180, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{color: '#DEDEE0', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Safety Cover Countdown</div>
            </div>
            <div style={{width: 260, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{width: 260, color: '#9999A1', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', lineHeight: 15, wordWrap: 'break-word'}}>Same overlay mechanic as the checkbox table — applies wherever the cell accepts clicks: Normal (both), Inherited OFF, Disabled (both), Disabled+Inherited OFF. Excluded from Locked ON and Disabled+Locked ON (source owns the value). The cover wraps the 20×20 bounding target regardless of whether the wrapper chrome is painted or the glyph is bare. First click arms, drains over ~3s, second click commits; timeout re-locks. Red only during the armed countdown.</div>
            </div>
        </div>
        <div style={{width: 10, height: 16, position: 'relative'}} />
        <div style={{width: 552, height: 1, background: 'rgba(76.50, 76.50, 81.60, 0.80)'}} />
        <div style={{width: 10, height: 12, position: 'relative'}} />
        <div style={{width: 552, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{color: '#9999A1', fontSize: 10, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Design note</div>
            <div style={{width: 10, height: 6, position: 'relative'}} />
            <div style={{width: 552, color: '#9999A1', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', lineHeight: 16, wordWrap: 'break-word'}}>The asymmetry captures a real semantic rule: you can&apos;t hide a child of a visible parent (open cascades as lock), but you can individually show a child of a hidden parent (closed cascades as hint). The wrapper-vs-bare visual split keeps Normal and Inherited feeling «alive» while Locked and Disabled read as «contained». Same red-during-armed-window rule applies.</div>
        </div>
    </div>
</div>