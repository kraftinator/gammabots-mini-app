'use client'

import React, { useState, useEffect, useRef } from 'react'

// Variable mappings (human-readable to abbreviated)
const VAR_MAPPINGS: Record<string, string> = {
  botProfit: 'bpp',
  buyCount: 'bcn',
  cma: 'cma',
  creationPrice: 'cap',
  currentPrice: 'cpr',
  highCMASinceInit: 'hma',
  highCMASinceTrade: 'hmt',
  highInitBuy: 'hip',
  highLastTrade: 'hlt',
  highSinceCreate: 'hps',
  initBuyPrice: 'ibp',
  listedBuyPrice: 'lbp',
  lma: 'lma',
  lowCMASinceCreate: 'lmc',
  lowCMASinceInit: 'lmi',
  lowCMASinceTrade: 'lmt',
  lowInitBuy: 'lip',
  lowLastTrade: 'llt',
  lowSinceCreate: 'lps',
  lastSellPrice: 'lsp',
  minSinceBuy: 'lba',
  minSinceCreate: 'crt',
  minSinceTrade: 'lta',
  mom: 'mom',
  movingAvg: 'mam',
  prevCMA: 'pcm',
  prevLMA: 'plm',
  prevPrice: 'ppr',
  priceDiv: 'pdi',
  profitLastCycle: 'lcp',
  profitSecondCycle: 'scp',
  rollingHigh: 'rhi',
  sellCount: 'scn',
  ssd: 'ssd',
  lsd: 'lsd',
  tma: 'tma',
  tokenAmt: 'bta',
  vlt: 'vlt',
  vst: 'vst',
}

// Sorted variable list for dropdowns
const VARIABLES = Object.keys(VAR_MAPPINGS).sort()

const OPERATORS = ['==', '!=', '>', '>=', '<', '<=']

const ACTION_TYPES = [
  { value: 'buy', label: 'buy', hasParam: false },
  { value: 'sell', label: 'sell (fraction)', hasParam: true },
  { value: 'sell all', label: 'sell all', hasParam: false },
  { value: 'liquidate', label: 'liquidate', hasParam: false },
  { value: 'deact', label: 'deact', hasParam: false },
  { value: 'reset', label: 'reset', hasParam: false },
  { value: 'skip', label: 'skip', hasParam: false },
]

const FRACTION_PRESETS = ['0.25', '0.33', '0.5', '1']

interface Condition {
  id: number
  left: string
  operator: string
  rightType: 'variable' | 'number'
  rightValue: string
  rightMultiplier: string
}

interface Action {
  id: number
  type: string
  param: string
}

interface Rule {
  id: number
  phase: 'buy' | 'sell'
  conditions: Condition[]
  actions: Action[]
}

interface StrategyBuilderProps {
  onStrategyChange?: (script: string, isValid: boolean) => void
}

export default function StrategyBuilder({ onStrategyChange }: StrategyBuilderProps) {
  const [previewMode, setPreviewMode] = useState<'readable' | 'raw'>('readable')
  const [focusedCondition, setFocusedCondition] = useState<{ stepId: number; condId: number } | null>(null)
  const [openMenuRuleId, setOpenMenuRuleId] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [rules, setRules] = useState<Rule[]>([
    {
      id: 1,
      phase: 'buy',
      conditions: [],
      actions: [{ id: 1, type: '', param: '' }],
    },
  ])
  const [gammaScript, setGammaScript] = useState('')

  // Generate condition string
  const generateConditionStr = (rule: Rule, useRaw = false): string => {
    const phaseCondition = rule.phase === 'buy'
      ? (useRaw ? 'bcn == 0' : 'buyCount == 0')
      : (useRaw ? 'bcn > 0' : 'buyCount > 0')

    const userCondStr = rule.conditions
      .filter(c => c.left && c.rightValue)
      .map(c => {
        const leftVar = useRaw ? (VAR_MAPPINGS[c.left] || c.left) : c.left
        let rightVar = c.rightValue
        if (c.rightType === 'variable') {
          rightVar = useRaw ? (VAR_MAPPINGS[c.rightValue] || c.rightValue) : c.rightValue
        }
        if (c.rightType === 'variable' && c.rightMultiplier && c.rightMultiplier !== '' && parseFloat(c.rightMultiplier) !== 1) {
          rightVar = `${rightVar} * ${c.rightMultiplier}`
        }
        return `${leftVar} ${c.operator} ${rightVar}`
      }).join(' && ')

    return userCondStr ? `${phaseCondition} && ${userCondStr}` : phaseCondition
  }

  // Generate actions array
  const generateActionsArr = (rule: Rule): string[] => {
    return rule.actions
      .filter(a => a.type)
      .map(a => {
        if (a.type === 'sell' && a.param) {
          return `sell ${a.param}`
        }
        return a.type
      })
  }

  // Generate readable format
  const generateReadable = (): string => {
    return rules.map((rule, index) => {
      const condStr = generateConditionStr(rule, false)
      const actions = generateActionsArr(rule)
      return `${index + 1}  c: ${condStr}\n    a: ${actions.join(', ')}`
    }).join('\n\n')
  }

  // Generate raw format
  const generateRaw = (): string => {
    const ruleObjs = rules.map(rule => {
      const condStr = generateConditionStr(rule, false)
      const actions = generateActionsArr(rule)
      return { c: condStr, a: actions }
    })
    const lines = ruleObjs.map(r => {
      const actionsStr = JSON.stringify(r.a)
      return `  {\n    "c": "${r.c}",\n    "a": ${actionsStr}\n  }`
    })
    return `[\n${lines.join(',\n')}\n]`
  }

  // Validation
  const isRuleValid = (rule: Rule): boolean => {
    const userConditionsValid = rule.conditions.every(c =>
      (!c.left && !c.rightValue) || (c.left && c.operator && c.rightValue)
    )
    const hasValidActions = rule.actions.length > 0 &&
      rule.actions.every(a => a.type && (a.type !== 'sell' || a.param))
    return userConditionsValid && hasValidActions
  }

  const isFormValid = rules.length > 0 && rules.every(isRuleValid)

  // Update preview and notify parent
  useEffect(() => {
    const script = previewMode === 'raw' ? generateRaw() : generateReadable()
    setGammaScript(script)
  }, [rules, previewMode])

  useEffect(() => {
    const rawScript = generateRaw()
    onStrategyChange?.(rawScript, isFormValid)
  }, [rules, isFormValid])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuRuleId(null)
      }
    }
    if (openMenuRuleId !== null) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuRuleId])

  // Rule management
  const addRule = () => {
    const newId = Math.max(...rules.map(r => r.id), 0) + 1
    setRules([...rules, {
      id: newId,
      phase: 'buy',
      conditions: [],
      actions: [{ id: 1, type: '', param: '' }],
    }])
  }

  const removeRule = (ruleId: number) => {
    if (rules.length > 1) {
      setRules(rules.filter(r => r.id !== ruleId))
    }
  }

  const updatePhase = (ruleId: number, phase: 'buy' | 'sell') => {
    setRules(rules.map(rule =>
      rule.id === ruleId ? { ...rule, phase } : rule
    ))
  }

  const moveRule = (ruleId: number, direction: 'up' | 'down') => {
    const index = rules.findIndex(r => r.id === ruleId)
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === rules.length - 1)) {
      return
    }
    const newRules = [...rules]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    ;[newRules[index], newRules[swapIndex]] = [newRules[swapIndex], newRules[index]]
    setRules(newRules)
  }

  // Condition management
  const addCondition = (ruleId: number) => {
    setRules(rules.map(rule => {
      if (rule.id === ruleId) {
        const newId = rule.conditions.length > 0 ? Math.max(...rule.conditions.map(c => c.id)) + 1 : 1
        return {
          ...rule,
          conditions: [...rule.conditions, {
            id: newId,
            left: '',
            operator: '==',
            rightType: 'variable' as const,
            rightValue: '',
            rightMultiplier: '',
          }],
        }
      }
      return rule
    }))
  }

  const removeCondition = (ruleId: number, condId: number) => {
    setRules(rules.map(rule => {
      if (rule.id === ruleId) {
        return {
          ...rule,
          conditions: rule.conditions.filter(c => c.id !== condId),
        }
      }
      return rule
    }))
  }

  const updateCondition = (ruleId: number, condId: number, field: keyof Condition, value: string) => {
    setRules(prevRules => prevRules.map(rule => {
      if (rule.id === ruleId) {
        return {
          ...rule,
          conditions: rule.conditions.map(c =>
            c.id === condId ? { ...c, [field]: value } : c
          ),
        }
      }
      return rule
    }))
  }

  const updateConditionMultiple = (ruleId: number, condId: number, updates: Partial<Condition>) => {
    setRules(prevRules => prevRules.map(rule => {
      if (rule.id === ruleId) {
        return {
          ...rule,
          conditions: rule.conditions.map(c =>
            c.id === condId ? { ...c, ...updates } : c
          ),
        }
      }
      return rule
    }))
  }

  // Action management
  const addAction = (ruleId: number) => {
    setRules(rules.map(rule => {
      if (rule.id === ruleId) {
        const newId = Math.max(...rule.actions.map(a => a.id), 0) + 1
        return {
          ...rule,
          actions: [...rule.actions, { id: newId, type: '', param: '' }],
        }
      }
      return rule
    }))
  }

  const removeAction = (ruleId: number, actionId: number) => {
    setRules(rules.map(rule => {
      if (rule.id === ruleId && rule.actions.length > 1) {
        return {
          ...rule,
          actions: rule.actions.filter(a => a.id !== actionId),
        }
      }
      return rule
    }))
  }

  const updateAction = (ruleId: number, actionId: number, field: keyof Action, value: string) => {
    setRules(rules.map(rule => {
      if (rule.id === ruleId) {
        return {
          ...rule,
          actions: rule.actions.map(a =>
            a.id === actionId ? { ...a, [field]: value } : a
          ),
        }
      }
      return rule
    }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Rules */}
      {rules.map((rule, ruleIndex) => (
        <div
          key={rule.id}
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
              {/* Rule Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}>
                <span style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#8b5cf6',
                }}>
                  Rule {ruleIndex + 1}
                </span>
                <div style={{ position: 'relative' }} ref={openMenuRuleId === rule.id ? menuRef : null}>
                  <button
                    onClick={() => setOpenMenuRuleId(openMenuRuleId === rule.id ? null : rule.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      fontSize: '18px',
                      color: '#888',
                      lineHeight: 1,
                    }}
                  >
                    ⋮
                  </button>
                  {openMenuRuleId === rule.id && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                      minWidth: '140px',
                      zIndex: 10,
                      overflow: 'hidden',
                    }}>
                      <button
                        onClick={() => {
                          moveRule(rule.id, 'up')
                          setOpenMenuRuleId(null)
                        }}
                        disabled={ruleIndex === 0}
                        style={{
                          width: '100%',
                          padding: '6px 12px',
                          border: 'none',
                          background: 'none',
                          textAlign: 'left',
                          fontSize: '13px',
                          color: ruleIndex === 0 ? '#ccc' : '#333',
                          cursor: ruleIndex === 0 ? 'default' : 'pointer',
                        }}
                      >
                        Move up
                      </button>
                      <button
                        onClick={() => {
                          moveRule(rule.id, 'down')
                          setOpenMenuRuleId(null)
                        }}
                        disabled={ruleIndex === rules.length - 1}
                        style={{
                          width: '100%',
                          padding: '6px 12px',
                          border: 'none',
                          background: 'none',
                          textAlign: 'left',
                          fontSize: '13px',
                          color: ruleIndex === rules.length - 1 ? '#ccc' : '#333',
                          cursor: ruleIndex === rules.length - 1 ? 'default' : 'pointer',
                        }}
                      >
                        Move down
                      </button>
                      {rules.length > 1 && (
                        <button
                          onClick={() => {
                            removeRule(rule.id)
                            setOpenMenuRuleId(null)
                          }}
                          style={{
                            width: '100%',
                            padding: '6px 12px',
                            border: 'none',
                            background: 'none',
                            textAlign: 'left',
                            fontSize: '13px',
                            color: '#ef4444',
                            cursor: 'pointer',
                            borderTop: '1px solid #f0f0f0',
                          }}
                        >
                          Delete rule
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Phase Toggle */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'flex',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '8px',
                  padding: '3px',
                }}>
                  <button
                    onClick={() => updatePhase(rule.id, 'buy')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: rule.phase === 'buy' ? '#fff' : 'transparent',
                      color: rule.phase === 'buy' ? '#10b981' : '#666',
                      boxShadow: rule.phase === 'buy' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Buy Phase
                  </button>
                  <button
                    onClick={() => updatePhase(rule.id, 'sell')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: rule.phase === 'sell' ? '#fff' : 'transparent',
                      color: rule.phase === 'sell' ? '#f97316' : '#666',
                      boxShadow: rule.phase === 'sell' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Sell Phase
                  </button>
                </div>
              </div>

              {/* Conditions */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#888',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}>
                  Conditions
                </div>

                {/* Implicit Phase Condition (locked) */}
                <div style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '8px',
                  opacity: 0.7,
                }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{
                      flex: 1,
                      maxWidth: '220px',
                      padding: '10px 8px',
                      fontSize: '13px',
                      backgroundColor: '#eee',
                      borderRadius: '8px',
                      color: '#666',
                    }}>
                      buyCount
                    </div>
                    <div style={{
                      width: '70px',
                      padding: '10px 4px',
                      fontSize: '13px',
                      backgroundColor: '#eee',
                      borderRadius: '8px',
                      color: '#666',
                      textAlign: 'center',
                    }}>
                      {rule.phase === 'buy' ? '==' : '>'}
                    </div>
                    <div style={{ width: '26px', flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                    <div style={{
                      flex: 1,
                      maxWidth: '220px',
                      padding: '10px 8px',
                      fontSize: '13px',
                      backgroundColor: '#eee',
                      borderRadius: '8px',
                      color: '#666',
                    }}>
                      0
                    </div>
                    <div style={{ width: '104px', flexShrink: 0 }}></div>
                  </div>
                </div>

                {/* User Conditions */}
                {rule.conditions.map((cond) => (
                  <div key={cond.id}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#8b5cf6',
                      textAlign: 'center',
                      margin: '8px 0',
                    }}>
                      AND
                    </div>
                    <div
                      style={{
                        backgroundColor: '#f9f9f9',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '8px',
                      }}
                      onFocus={() => setFocusedCondition({ stepId: rule.id, condId: cond.id })}
                      onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                          setFocusedCondition(null)
                        }
                      }}
                    >
                      {/* Row 1: Left variable + Operator */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                        <select
                          value={cond.left}
                          onChange={(e) => updateCondition(rule.id, cond.id, 'left', e.target.value)}
                          style={{
                            flex: 1,
                            padding: '10px 8px',
                            fontSize: '13px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            backgroundColor: '#fff',
                          }}
                        >
                          <option value="">Select variable...</option>
                          {VARIABLES.map(v => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>

                        <select
                          value={cond.operator}
                          onChange={(e) => updateCondition(rule.id, cond.id, 'operator', e.target.value)}
                          style={{
                            width: '70px',
                            padding: '10px 4px',
                            fontSize: '13px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            backgroundColor: '#fff',
                            flexShrink: 0,
                          }}
                        >
                          {OPERATORS.map(op => (
                            <option key={op} value={op}>{op}</option>
                          ))}
                        </select>

                        <button
                          onClick={() => removeCondition(rule.id, cond.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Row 2: Right operand + Multiplier */}
                      {/* Use same right-side width as Row 1: operator (70px) + gap (8px) + button (26px) = 104px */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {cond.rightType === 'number' ? (
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={cond.rightValue}
                              onChange={(e) => {
                                const val = e.target.value
                                if (val === '' || /^-?\d*\.?\d*$/.test(val)) {
                                  updateCondition(rule.id, cond.id, 'rightValue', val)
                                }
                              }}
                              onBlur={(e) => {
                                const val = e.target.value
                                if (val.startsWith('.')) {
                                  updateCondition(rule.id, cond.id, 'rightValue', '0' + val)
                                }
                              }}
                              placeholder="Enter number"
                              style={{
                                width: '100%',
                                padding: '10px 8px',
                                fontSize: '13px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                boxSizing: 'border-box',
                              }}
                            />
                            <button
                              onClick={() => updateConditionMultiple(rule.id, cond.id, { rightType: 'variable', rightValue: '', rightMultiplier: '' })}
                              style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '12px',
                                color: '#8b5cf6',
                                cursor: 'pointer',
                                padding: '0',
                                textAlign: 'left',
                              }}
                            >
                              Use variable instead
                            </button>
                          </div>
                        ) : (
                          <>
                            <select
                              value={cond.rightValue}
                              onChange={(e) => {
                                if (e.target.value === '__number__') {
                                  updateConditionMultiple(rule.id, cond.id, { rightType: 'number', rightValue: '', rightMultiplier: '' })
                                } else {
                                  updateCondition(rule.id, cond.id, 'rightValue', e.target.value)
                                }
                              }}
                              style={{
                                flex: 1,
                                padding: '10px 8px',
                                fontSize: '13px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                backgroundColor: '#fff',
                              }}
                            >
                              <option value="">Select variable...</option>
                              {VARIABLES.map(v => (
                                <option key={v} value={v}>{v}</option>
                              ))}
                              <option value="__number__">Enter number...</option>
                            </select>

                            {/* Multiplier - fixed width container to match Row 1 right side: operator (70px) + button (26px) = 96px */}
                            <div style={{ width: '104px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {cond.rightValue && cond.rightValue !== '' && (
                                cond.rightMultiplier ||
                                (focusedCondition && focusedCondition.stepId === rule.id && focusedCondition.condId === cond.id)
                              ) && (
                                <>
                                  <span style={{ fontSize: '13px', color: '#888' }}>×</span>
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={cond.rightMultiplier || ''}
                                    onChange={(e) => {
                                      const val = e.target.value
                                      if (val === '' || /^-?\d*\.?\d*$/.test(val)) {
                                        updateCondition(rule.id, cond.id, 'rightMultiplier', val)
                                      }
                                    }}
                                    onBlur={(e) => {
                                      const val = e.target.value
                                      if (val.startsWith('.')) {
                                        updateCondition(rule.id, cond.id, 'rightMultiplier', '0' + val)
                                      }
                                    }}
                                    placeholder="1.0"
                                    style={{
                                      width: '66px',
                                      padding: '10px 8px',
                                      fontSize: '13px',
                                      border: '1px solid rgba(221, 221, 221, 0.75)',
                                      borderRadius: '8px',
                                      boxSizing: 'border-box',
                                      backgroundColor: '#fff',
                                    }}
                                  />
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => addCondition(rule.id)}
                  style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#8b5cf6',
                    backgroundColor: 'transparent',
                    border: '1px dashed #8b5cf6',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  + Add Condition
                </button>
              </div>

              {/* Actions */}
              <div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#888',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}>
                  Actions
                </div>

                {rule.actions.map((action) => (
                  <div
                    key={action.id}
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <select
                      value={action.type}
                      onChange={(e) => updateAction(rule.id, action.id, 'type', e.target.value)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        fontSize: '13px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                      }}
                    >
                      <option value="">Select action...</option>
                      {ACTION_TYPES
                        .filter(at => {
                          if (rule.phase === 'buy') {
                            return ['buy', 'deact', 'skip'].includes(at.value)
                          } else {
                            return at.value !== 'buy'
                          }
                        })
                        .map(at => (
                          <option key={at.value} value={at.value}>{at.label}</option>
                        ))}
                    </select>

                    {/* Fraction param for sell */}
                    {action.type === 'sell' && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {FRACTION_PRESETS.map(f => (
                          <button
                            key={f}
                            onClick={() => updateAction(rule.id, action.id, 'param', f)}
                            style={{
                              padding: '8px 10px',
                              fontSize: '12px',
                              fontWeight: action.param === f ? '600' : '400',
                              border: '1px solid',
                              borderColor: action.param === f ? '#14b8a6' : '#ddd',
                              borderRadius: '6px',
                              backgroundColor: action.param === f ? '#e0f7f5' : '#fff',
                              color: action.param === f ? '#14b8a6' : '#666',
                              cursor: 'pointer',
                            }}
                          >
                            {f === '1' ? 'all' : `${parseFloat(f) * 100}%`}
                          </button>
                        ))}
                      </div>
                    )}

                    {rule.actions.length > 1 && (
                      <button
                        onClick={() => removeAction(rule.id, action.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}

                {/* Buy phase: max 1 action, Sell phase: max 2 actions */}
                {((rule.phase === 'buy' && rule.actions.length < 1) ||
                  (rule.phase === 'sell' && rule.actions.length < 2)) && (
                  <button
                    onClick={() => addAction(rule.id)}
                    style={{
                      padding: '8px 12px',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#14b8a6',
                      backgroundColor: 'transparent',
                      border: '1px dashed #14b8a6',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      width: '100%',
                    }}
                  >
                    + Add Action
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add Rule Button */}
          <button
            onClick={addRule}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#8b5cf6',
              backgroundColor: '#fff',
              border: '2px dashed #8b5cf6',
              borderRadius: '12px',
              cursor: 'pointer',
            }}
          >
            + Add Rule
          </button>

          {/* GammaScript Preview */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                GammaScript Preview
              </span>
              {previewMode === 'raw' && (
                <button
                  onClick={() => navigator.clipboard?.writeText(gammaScript)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                </button>
              )}
            </div>

            {/* Readable / Raw toggle */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <span
                onClick={() => setPreviewMode('readable')}
                style={{
                  fontSize: '12px',
                  fontWeight: previewMode === 'readable' ? '600' : '400',
                  color: previewMode === 'readable' ? '#333' : '#888',
                  cursor: 'pointer',
                }}
              >
                Readable
              </span>
              <span
                onClick={() => setPreviewMode('raw')}
                style={{
                  fontSize: '12px',
                  fontWeight: previewMode === 'raw' ? '600' : '400',
                  color: previewMode === 'raw' ? '#333' : '#888',
                  cursor: 'pointer',
                }}
              >
                Raw
              </span>
            </div>

            <div style={{
              backgroundColor: '#f0f0f0',
              borderRadius: '8px',
              padding: '12px',
              fontFamily: 'ui-monospace, monospace',
              fontSize: '13px',
              color: '#333',
            }}>
              {previewMode === 'readable' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {rules.map((rule, index) => {
                    const condStr = generateConditionStr(rule, false)
                    const actions = generateActionsArr(rule)
                    return (
                      <div key={rule.id}>
                        <div style={{ display: 'flex', fontSize: '12px' }}>
                          <span style={{ flexShrink: 0, color: '#9ca3af', fontSize: '13px' }}>{index + 1}&nbsp;&nbsp;</span>
                          <span style={{ flexShrink: 0, color: 'rgba(139, 92, 246, 0.7)' }}>c:&nbsp;</span>
                          <span style={{ wordBreak: 'break-word' }}>{condStr}</span>
                        </div>
                        <div style={{ display: 'flex', marginTop: '-2px', fontSize: '12px' }}>
                          <span style={{ flexShrink: 0, color: '#9ca3af', fontSize: '13px' }}>&nbsp;&nbsp;&nbsp;</span>
                          <span style={{ flexShrink: 0, color: 'rgba(139, 92, 246, 0.7)' }}>a:&nbsp;</span>
                          <span>{actions.join(', ') || '...'}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ whiteSpace: 'pre', overflowX: 'auto', fontSize: '12px' }}>
                  {gammaScript || '[[condition,action]]'}
                </div>
              )}
            </div>
          </div>
    </div>
  )
}
