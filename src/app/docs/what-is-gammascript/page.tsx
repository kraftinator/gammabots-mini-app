'use client'

import Link from 'next/link'
import RobotLogo from '@/components/RobotLogo'

export default function WhatIsGammaScriptPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#2d3f54',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <RobotLogo size={40} />
          <span style={{ color: 'white', fontSize: '20px', fontWeight: '600', letterSpacing: '0.05em' }}>
            GAMMABOTS
          </span>
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link href="/docs/how-it-works" style={{ color: '#cbd5e1', fontSize: '14px', textDecoration: 'none' }}>
            How it Works
          </Link>
          <Link href="/docs/what-is-gammascript" style={{ color: 'white', fontSize: '14px', textDecoration: 'none', fontWeight: '600' }}>
            GammaScript
          </Link>
          <a
            href="https://farcaster.xyz/miniapps/S8DW4VMywzs_/gammabots"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: '#14b8a6',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            Open Mini App
          </a>
        </nav>
      </header>

      {/* Content */}
      <main style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '48px 24px',
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1a1a1a', marginBottom: '16px' }}>
          What Is GammaScript?
        </h1>

        <p style={{ fontSize: '18px', color: '#333', lineHeight: '1.6', marginBottom: '8px' }}>
          GammaScript is the language used to define <strong>trading strategies</strong> on Gammabots.
        </p>
        <p style={{ fontSize: '18px', color: '#333', lineHeight: '1.6', marginBottom: '16px' }}>
          A GammaScript strategy describes <strong>when a bot should buy, sell, wait, exit, or shut down</strong>, based on market conditions and the bot's current state.
        </p>
        <p style={{ fontSize: '16px', color: '#444', lineHeight: '1.6', marginBottom: '8px' }}>It is designed to be:</p>
        <ul style={{ margin: '0 0 12px 0', paddingLeft: '24px', fontSize: '16px', color: '#444', lineHeight: '1.7', listStyleType: 'disc' }}>
          <li style={{ marginBottom: '6px' }}><strong style={{ color: '#1a1a1a' }}>deterministic</strong> — the same inputs always produce the same behavior</li>
          <li style={{ marginBottom: '6px' }}><strong style={{ color: '#1a1a1a' }}>transparent</strong> — strategies can be inspected and understood</li>
          <li style={{ marginBottom: '6px' }}><strong style={{ color: '#1a1a1a' }}>safe</strong> — bots can only act within a limited, predefined set of actions</li>
        </ul>
        <p style={{ fontSize: '16px', color: '#444', lineHeight: '1.6', marginBottom: '32px' }}>
          Every strategy on Gammabots runs using GammaScript.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', margin: '32px 0' }} />

        <Section title="What GammaScript Does">
          <p>At a high level, a GammaScript strategy is a <strong>set of rules</strong>.</p>
          <p>Each rule consists of:</p>
          <ul>
            <li>a <strong>condition</strong> (when this rule applies)</li>
            <li>one or more <strong>actions</strong> (what the bot should do)</li>
          </ul>
          <p>On every evaluation cycle, the bot:</p>
          <ol>
            <li>checks each rule in order</li>
            <li>finds the first rule whose condition is true</li>
            <li>executes that rule's actions</li>
            <li>stops</li>
          </ol>
          <p>Only one rule can execute per cycle.</p>
        </Section>

        <Section title="Conditions">
          <p>Conditions are logical expressions that determine <strong>when a rule applies</strong>.</p>
          <p>They compare market data and bot state using:</p>
          <ul>
            <li>numeric comparisons (<Code>&gt;</Code>, <Code>&lt;</Code>, <Code>&gt;=</Code>, <Code>&lt;=</Code>, <Code>==</Code>, <Code>!=</Code>)</li>
            <li>arithmetic (<Code>+</Code>, <Code>-</Code>, <Code>*</Code>, <Code>/</Code>)</li>
            <li>logical <strong>AND</strong> (<Code>&amp;&amp;</Code>)</li>
          </ul>
          <p>Conditions can reference values such as:</p>
          <ul>
            <li>current price</li>
            <li>price history and moving averages</li>
            <li>volatility and momentum indicators</li>
            <li>how long it's been since the last trade or buy</li>
            <li>how many buys or sells have occurred</li>
            <li>whether the bot is currently holding tokens</li>
          </ul>
          <p>Conditions are evaluated continuously as market data updates.</p>
          <p><strong>GammaScript does not support <Code>or</Code>.</strong> Instead, rules are evaluated sequentially, and <strong>rule ordering</strong> is used to express branching or fallback logic.</p>
        </Section>

        <Section title="Actions">
          <p>Actions describe <strong>what the bot should do</strong> when a condition is met.</p>
          <p>Supported actions include:</p>
          <ul>
            <li>
              <strong>buy</strong><br />
              Enters a position using the bot's available ETH.
            </li>
            <li>
              <strong>sell</strong><br />
              Sells a portion of the bot's current token position, subject to strategy-defined constraints.
            </li>
            <li>
              <strong>liquidate</strong><br />
              Sells the entire token position <strong>without slippage constraints</strong>, exiting the position as quickly as possible. This is typically used to exit immediately.
            </li>
            <li>
              <strong>deactivate</strong><br />
              Shuts down the bot and returns funds to the user. After deactivation, the bot becomes inactive and no longer trades.
            </li>
            <li>
              <strong>skip</strong><br />
              Intentionally does nothing for this evaluation cycle.
            </li>
            <li>
              <strong>reset</strong><br />
              Resets the bot's internal state <strong>after a sell trade</strong>, effectively starting the strategy over from the beginning.
            </li>
          </ul>
          <p>Bots cannot perform any action outside this list.</p>
          <p>This restriction is intentional — it keeps strategies predictable and safe.</p>
        </Section>

        <Section title="Strategy Execution">
          <p>GammaScript strategies are executed by the Gammabots engine.</p>
          <p>Important properties of execution:</p>
          <ul>
            <li>rules are evaluated in order</li>
            <li>only the <strong>first</strong> matching rule executes</li>
            <li>actions run atomically within a cycle</li>
            <li>safeguards prevent repeated or conflicting actions</li>
          </ul>
          <p>If no rule matches, the bot waits and re-evaluates on the next cycle.</p>
        </Section>

        <Section title="Strategy Variables">
          <p>GammaScript exposes a fixed set of variables that represent:</p>
          <ul>
            <li>market prices</li>
            <li>technical indicators</li>
            <li>time since events</li>
            <li>bot state (buys, sells, position size, profitability)</li>
          </ul>
          <p>To keep strategies compact and efficient, variables are represented internally using short identifiers.</p>
          <p>In the UI and Strategy Builder, these variables are displayed using <strong>human-readable names and labels</strong>.</p>
          <p>You do not need to memorize variable codes unless you are writing GammaScript directly.</p>
        </Section>

        <Section title="Writing vs Building Strategies">
          <p>You can create GammaScript strategies in two ways.</p>

          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginTop: '24px', marginBottom: '12px' }}>
            Writing GammaScript Directly
          </h3>
          <p>Advanced users can write strategies directly using GammaScript syntax.</p>
          <p>This offers:</p>
          <ul>
            <li>maximum flexibility</li>
            <li>precise control over rule ordering</li>
            <li>full access to all supported variables and operators</li>
          </ul>
          <p>All strategies are validated before being accepted to ensure they are safe and well-formed.</p>

          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginTop: '24px', marginBottom: '12px' }}>
            Using the Strategy Builder
          </h3>
          <p>Most users will use the <strong>Strategy Builder</strong>.</p>
          <p>The builder:</p>
          <ul>
            <li>generates valid GammaScript automatically</li>
            <li>prevents invalid conditions or actions</li>
            <li>makes strategies easier to reason about visually</li>
          </ul>
          <p>Under the hood, the builder still produces GammaScript — you're just not required to write it yourself.</p>
        </Section>

        <Section title="Strategies as NFTs">
          <p>Every GammaScript strategy is minted as a <strong>Strategy NFT</strong>.</p>
          <p>Key properties:</p>
          <ul>
            <li>strategies are <strong>immutable</strong></li>
            <li>the logic cannot be changed once created</li>
            <li>every bot using a strategy runs the exact same code</li>
          </ul>
          <p>If you want to modify a strategy:</p>
          <ul>
            <li>clone it</li>
            <li>make changes</li>
            <li>mint a new strategy NFT</li>
          </ul>
          <p>This ensures transparency, trust, and reproducibility across all bots.</p>
        </Section>

        <Section title="Why GammaScript Exists">
          <p>GammaScript exists to strike a balance between:</p>
          <ul>
            <li>expressiveness</li>
            <li>safety</li>
            <li>transparency</li>
          </ul>
          <p>It is powerful enough to express sophisticated trading logic, while remaining constrained enough to:</p>
          <ul>
            <li>prevent unexpected behavior</li>
            <li>make strategies inspectable</li>
            <li>ensure fair and consistent execution</li>
          </ul>
          <p>GammaScript is what makes Gammabots predictable, composable, and trustworthy.</p>
        </Section>

        <p style={{ fontSize: '16px', color: '#444', lineHeight: '1.6' }}>
          If you want to see how GammaScript strategies are used in practice, explore the Strategy Builder or inspect existing strategies on the dashboard.
        </p>

        <p style={{ fontSize: '16px', color: '#444', lineHeight: '1.6', marginTop: '24px' }}>
          <Link href="/docs/how-it-works" style={{ color: '#14b8a6', textDecoration: 'none', fontWeight: '500' }}>
            ← Back to How it Works
          </Link>
        </p>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '24px',
        textAlign: 'center',
        color: '#8e8e93',
        fontSize: '14px',
      }}>
        <p>Gammabots runs on Base.</p>
      </footer>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '600',
        color: '#1a1a1a',
        marginTop: '40px',
        marginBottom: '16px',
      }}>
        {title}
      </h2>
      <div style={{
        fontSize: '16px',
        color: '#444',
        lineHeight: '1.7',
      }}>
        <style jsx>{`
          div :global(p) {
            margin-bottom: 12px;
          }
          div :global(ul) {
            margin: 0 0 12px 0;
            padding-left: 24px;
            list-style-type: disc;
          }
          div :global(ol) {
            margin: 0 0 12px 0;
            padding-left: 24px;
            list-style-type: decimal;
          }
          div :global(li) {
            margin-bottom: 6px;
          }
          div :global(strong) {
            font-weight: 600;
            color: #1a1a1a;
          }
        `}</style>
        {children}
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', margin: '32px 0' }} />
    </>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code style={{
      backgroundColor: '#f0f0f0',
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '14px',
      fontFamily: 'monospace',
    }}>
      {children}
    </code>
  )
}
