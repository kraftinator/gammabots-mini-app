'use client'

import { useRouter } from 'next/navigation'
import BottomNavigation from '@/components/BottomNavigation'

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column' as const,
    paddingBottom: '80px',
  },
  header: {
    padding: '16px',
    backgroundColor: '#fff',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    padding: '0',
    marginBottom: '16px',
    cursor: 'pointer',
    color: '#14b8a6',
    fontSize: '14px',
    fontWeight: '500' as const,
  },
  title: {
    fontSize: '24px',
    fontWeight: '700' as const,
    color: '#1a1a1a',
    margin: 0,
  },
  content: {
    flex: 1,
    padding: '16px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  intro: {
    fontSize: '15px',
    color: '#333',
    lineHeight: '1.6',
    marginBottom: '12px',
  },
  h2: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: '#1a1a1a',
    marginTop: '28px',
    marginBottom: '12px',
  },
  h3: {
    fontSize: '15px',
    fontWeight: '600' as const,
    color: '#1a1a1a',
    marginTop: '20px',
    marginBottom: '8px',
  },
  p: {
    fontSize: '14px',
    color: '#444',
    lineHeight: '1.6',
    marginBottom: '12px',
  },
  ul: {
    margin: '0 0 12px 0',
    paddingLeft: '20px',
    listStyleType: 'disc' as const,
  },
  ol: {
    margin: '0 0 12px 0',
    paddingLeft: '20px',
    listStyleType: 'decimal',
  },
  li: {
    fontSize: '14px',
    color: '#444',
    lineHeight: '1.6',
    marginBottom: '6px',
    display: 'list-item',
  },
  strong: {
    fontWeight: '600' as const,
    color: '#1a1a1a',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e5e5e5',
    margin: '24px 0',
  },
  code: {
    backgroundColor: '#f0f0f0',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '13px',
    fontFamily: 'monospace',
  },
  link: {
    color: '#14b8a6',
    textDecoration: 'none',
    fontWeight: '500' as const,
    cursor: 'pointer',
  },
}

export default function WhatIsGammaScriptPage() {
  const router = useRouter()

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => router.back()} style={styles.backButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
        <h1 style={styles.title}>What Is GammaScript?</h1>
      </div>

      <div style={styles.content}>
        <div style={styles.card}>
          <p style={styles.intro}>
            GammaScript is the language used to define <strong style={styles.strong}>trading strategies</strong> on Gammabots.
          </p>
          <p style={styles.intro}>
            A GammaScript strategy describes <strong style={styles.strong}>when a bot should buy, sell, wait, exit, or shut down</strong>, based on market conditions and the bot's current state.
          </p>
          <p style={styles.p}>It is designed to be:</p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong style={styles.strong}>deterministic</strong> — the same inputs always produce the same behavior</li>
            <li style={styles.li}><strong style={styles.strong}>transparent</strong> — strategies can be inspected and understood</li>
            <li style={styles.li}><strong style={styles.strong}>safe</strong> — bots can only act within a limited, predefined set of actions</li>
          </ul>
          <p style={styles.p}>
            Every strategy on Gammabots runs using GammaScript.
          </p>

          <hr style={styles.divider} />

          <h2 style={styles.h2}>What GammaScript Does</h2>
          <p style={styles.p}>
            At a high level, a GammaScript strategy is a <strong style={styles.strong}>set of rules</strong>.
          </p>
          <p style={styles.p}>Each rule consists of:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>a <strong style={styles.strong}>condition</strong> (when this rule applies)</li>
            <li style={styles.li}>one or more <strong style={styles.strong}>actions</strong> (what the bot should do)</li>
          </ul>
          <p style={styles.p}>On every evaluation cycle, the bot:</p>
          <ol style={styles.ol}>
            <li style={styles.li}>checks each rule in order</li>
            <li style={styles.li}>finds the first rule whose condition is true</li>
            <li style={styles.li}>executes that rule's actions</li>
            <li style={styles.li}>stops</li>
          </ol>
          <p style={styles.p}>
            Only one rule can execute per cycle.
          </p>

          <hr style={styles.divider} />

          <h2 style={styles.h2}>Conditions</h2>
          <p style={styles.p}>
            Conditions are logical expressions that determine <strong style={styles.strong}>when a rule applies</strong>.
          </p>
          <p style={styles.p}>They compare market data and bot state using:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>numeric comparisons (<code style={styles.code}>&gt;</code>, <code style={styles.code}>&lt;</code>, <code style={styles.code}>&gt;=</code>, <code style={styles.code}>&lt;=</code>, <code style={styles.code}>==</code>, <code style={styles.code}>!=</code>)</li>
            <li style={styles.li}>arithmetic (<code style={styles.code}>+</code>, <code style={styles.code}>-</code>, <code style={styles.code}>*</code>, <code style={styles.code}>/</code>)</li>
            <li style={styles.li}>logical <strong style={styles.strong}>AND</strong> (<code style={styles.code}>&amp;&amp;</code>)</li>
          </ul>
          <p style={styles.p}>Conditions can reference values such as:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>current price</li>
            <li style={styles.li}>price history and moving averages</li>
            <li style={styles.li}>volatility and momentum indicators</li>
            <li style={styles.li}>how long it's been since the last trade or buy</li>
            <li style={styles.li}>how many buys or sells have occurred</li>
            <li style={styles.li}>whether the bot is currently holding tokens</li>
          </ul>
          <p style={styles.p}>
            Conditions are evaluated continuously as market data updates.
          </p>
          <p style={styles.p}>
            <strong style={styles.strong}>GammaScript does not support <code style={styles.code}>or</code>.</strong><br />
            Instead, rules are evaluated sequentially, and <strong style={styles.strong}>rule ordering</strong> is used to express branching or fallback logic.
          </p>

          <hr style={styles.divider} />

          <h2 style={styles.h2}>Actions</h2>
          <p style={styles.p}>
            Actions describe <strong style={styles.strong}>what the bot should do</strong> when a condition is met.
          </p>
          <p style={styles.p}>Supported actions include:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>
              <strong style={styles.strong}>buy</strong><br />
              Enters a position using the bot's available ETH.
            </li>
            <li style={styles.li}>
              <strong style={styles.strong}>sell</strong><br />
              Sells a portion of the bot's current token position, subject to strategy-defined constraints.
            </li>
            <li style={styles.li}>
              <strong style={styles.strong}>liquidate</strong><br />
              Sells the entire token position <strong style={styles.strong}>without slippage constraints</strong>, exiting the position as quickly as possible. This is typically used to exit immediately.
            </li>
            <li style={styles.li}>
              <strong style={styles.strong}>deactivate</strong><br />
              Shuts down the bot and returns funds to the user. After deactivation, the bot becomes inactive and no longer trades.
            </li>
            <li style={styles.li}>
              <strong style={styles.strong}>skip</strong><br />
              Intentionally does nothing for this evaluation cycle.
            </li>
            <li style={styles.li}>
              <strong style={styles.strong}>reset</strong><br />
              Resets the bot's internal state <strong style={styles.strong}>after a sell trade</strong>, effectively starting the strategy over from the beginning.
            </li>
          </ul>
          <p style={styles.p}>
            Bots cannot perform any action outside this list.
          </p>
          <p style={styles.p}>
            This restriction is intentional — it keeps strategies predictable and safe.
          </p>

          <hr style={styles.divider} />

          <h2 style={styles.h2}>Strategy Execution</h2>
          <p style={styles.p}>
            GammaScript strategies are executed by the Gammabots engine.
          </p>
          <p style={styles.p}>Important properties of execution:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>rules are evaluated in order</li>
            <li style={styles.li}>only the <strong style={styles.strong}>first</strong> matching rule executes</li>
            <li style={styles.li}>actions run atomically within a cycle</li>
            <li style={styles.li}>safeguards prevent repeated or conflicting actions</li>
          </ul>
          <p style={styles.p}>
            If no rule matches, the bot waits and re-evaluates on the next cycle.
          </p>

          <hr style={styles.divider} />

          <h2 style={styles.h2}>Strategy Variables</h2>
          <p style={styles.p}>
            GammaScript exposes a fixed set of variables that represent:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}>market prices</li>
            <li style={styles.li}>technical indicators</li>
            <li style={styles.li}>time since events</li>
            <li style={styles.li}>bot state (buys, sells, position size, profitability)</li>
          </ul>
          <p style={styles.p}>
            To keep strategies compact and efficient, variables are represented internally using short identifiers.
          </p>
          <p style={styles.p}>
            In the UI and Strategy Builder, these variables are displayed using <strong style={styles.strong}>human-readable names and labels</strong>.
          </p>
          <p style={styles.p}>
            You do not need to memorize variable codes unless you are writing GammaScript directly.
          </p>

          <hr style={styles.divider} />

          <h2 style={styles.h2}>Writing vs Building Strategies</h2>
          <p style={styles.p}>
            You can create GammaScript strategies in two ways.
          </p>

          <h3 style={styles.h3}>Writing GammaScript Directly</h3>
          <p style={styles.p}>
            Advanced users can write strategies directly using GammaScript syntax.
          </p>
          <p style={styles.p}>This offers:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>maximum flexibility</li>
            <li style={styles.li}>precise control over rule ordering</li>
            <li style={styles.li}>full access to all supported variables and operators</li>
          </ul>
          <p style={styles.p}>
            All strategies are validated before being accepted to ensure they are safe and well-formed.
          </p>

          <h3 style={styles.h3}>Using the Strategy Builder</h3>
          <p style={styles.p}>
            Most users will use the <strong style={styles.strong}>Strategy Builder</strong>.
          </p>
          <p style={styles.p}>The builder:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>generates valid GammaScript automatically</li>
            <li style={styles.li}>prevents invalid conditions or actions</li>
            <li style={styles.li}>makes strategies easier to reason about visually</li>
          </ul>
          <p style={styles.p}>
            Under the hood, the builder still produces GammaScript — you're just not required to write it yourself.
          </p>

          <hr style={styles.divider} />

          <h2 style={styles.h2}>Strategies as NFTs</h2>
          <p style={styles.p}>
            Every GammaScript strategy is minted as a <strong style={styles.strong}>Strategy NFT</strong>.
          </p>
          <p style={styles.p}>Key properties:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>strategies are <strong style={styles.strong}>immutable</strong></li>
            <li style={styles.li}>the logic cannot be changed once created</li>
            <li style={styles.li}>every bot using a strategy runs the exact same code</li>
          </ul>
          <p style={styles.p}>If you want to modify a strategy:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>clone it</li>
            <li style={styles.li}>make changes</li>
            <li style={styles.li}>mint a new strategy NFT</li>
          </ul>
          <p style={styles.p}>
            This ensures transparency, trust, and reproducibility across all bots.
          </p>

          <hr style={styles.divider} />

          <h2 style={styles.h2}>Why GammaScript Exists</h2>
          <p style={styles.p}>
            GammaScript exists to strike a balance between:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}>expressiveness</li>
            <li style={styles.li}>safety</li>
            <li style={styles.li}>transparency</li>
          </ul>
          <p style={styles.p}>
            It is powerful enough to express sophisticated trading logic, while remaining constrained enough to:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}>prevent unexpected behavior</li>
            <li style={styles.li}>make strategies inspectable</li>
            <li style={styles.li}>ensure fair and consistent execution</li>
          </ul>
          <p style={styles.p}>
            GammaScript is what makes Gammabots predictable, composable, and trustworthy.
          </p>

          <hr style={styles.divider} />

          <p style={styles.p}>
            If you want to see how GammaScript strategies are used in practice, explore the Strategy Builder or inspect existing strategies on the dashboard.
          </p>

          <p style={{ ...styles.p, marginTop: '24px' }}>
            <span onClick={() => router.push('/docs/gammascript-reference')} style={styles.link}>→ View the GammaScript Reference</span>
          </p>
          <p style={styles.p}>
            <span onClick={() => router.push('/docs/gammascript-for-llms')} style={styles.link}>→ GammaScript for LLMs</span>
          </p>
        </div>
      </div>

      <BottomNavigation activeTab="home" />
    </div>
  )
}
