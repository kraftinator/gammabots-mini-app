'use client'

import Link from 'next/link'
import RobotLogo from '@/components/RobotLogo'

export default function HowItWorksPage() {
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
          <Link href="/docs/how-it-works" style={{ color: 'white', fontSize: '14px', textDecoration: 'none', fontWeight: '600' }}>
            How it Works
          </Link>
          <Link href="/docs/what-is-gammascript" style={{ color: '#cbd5e1', fontSize: '14px', textDecoration: 'none' }}>
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
          How Gammabots Works
        </h1>

        <p style={{ fontSize: '18px', color: '#333', lineHeight: '1.6', marginBottom: '8px' }}>
          Gammabots lets you deploy automated trading bots in seconds — without managing infrastructure or watching charts all day.
        </p>
        <p style={{ fontSize: '18px', color: '#333', lineHeight: '1.6', marginBottom: '32px' }}>
          Each bot follows a simple, transparent lifecycle.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', margin: '32px 0' }} />

        <Section title="1. Your Gammabots Wallet">
          <p>When you sign up for Gammabots, a dedicated wallet is created for you.</p>
          <p>This wallet:</p>
          <ul>
            <li>is used exclusively to run your bots</li>
            <li>holds the ETH you allocate to bots</li>
            <li>executes trades according to the strategies you choose</li>
          </ul>
          <p>You don't need to manage private keys or sign every trade. Gammabots handles execution, while your funds remain associated with your wallet.</p>
        </Section>

        <Section title="2. Choose a Token">
          <p>You start by choosing the token you want the bot to trade.</p>
          <p>All bots on Gammabots trade <strong>token / ETH pairs</strong>.</p>
          <p>This means:</p>
          <ul>
            <li>bots are funded with <strong>ETH</strong></li>
            <li>tokens are bought and sold <strong>against ETH</strong></li>
            <li>performance, profits, and balances are always measured in <strong>ETH</strong></li>
          </ul>
        </Section>

        <Section title="3. Choose a Strategy">
          <p>Strategies define <strong>how</strong> the bot trades.</p>
          <p>A strategy specifies:</p>
          <ul>
            <li>when the bot buys</li>
            <li>when it sells</li>
            <li>how it reacts to price movements</li>
          </ul>
          <p>All strategies on Gammabots are written in <strong>GammaScript</strong>, a purpose-built language for automated trading logic.</p>
          <p>You can create strategies in several ways:</p>
          <ul>
            <li><strong>Write GammaScript directly</strong> for full control</li>
            <li><strong>Use the Strategy Builder</strong> to construct strategies visually, without writing code</li>
            <li><strong>Clone existing strategies</strong> and tweak their logic or parameters</li>
          </ul>
          <p>Strategies are fully transparent and inspectable. You can always see exactly what a strategy does before using it.</p>

          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginTop: '24px', marginBottom: '12px' }}>
            Strategies Are NFTs
          </h3>
          <p>Each strategy is minted as an <strong>NFT</strong>.</p>
          <p>Strategies are <strong>immutable</strong> once created — their logic cannot be changed. This guarantees that every bot using a strategy is running the exact same code.</p>
          <p>If you want to modify a strategy, you simply:</p>
          <ul>
            <li>clone it</li>
            <li>make your changes</li>
            <li>mint it as a new strategy NFT</li>
          </ul>
          <p>This allows strategies to evolve over time while preserving trust and reproducibility.</p>
        </Section>

        <Section title="4. Configure the Bot">
          <p>To configure a bot, you set four things:</p>
          <ul>
            <li><strong>Token Address</strong> — The contract address of the token you want the bot to trade.</li>
            <li><strong>ETH Amount</strong> — The amount of ETH the bot will use as its trading capital.</li>
            <li><strong>Strategy</strong> — The strategy that defines how the bot buys and sells.</li>
            <li><strong>Moving Average</strong> — A strategy parameter (in minutes) that controls how the bot reacts to price changes.</li>
          </ul>
          <p>Once these are set, click <strong>Create Bot</strong> and confirm the transaction in your wallet.</p>
        </Section>

        <Section title="5. Fund the Bot">
          <p>After confirming in your wallet, the bot is funded with ETH.</p>
          <p>That ETH is sent to your <strong>Gammabots wallet</strong> and is:</p>
          <ul>
            <li>reserved for this bot</li>
            <li>controlled by the selected strategy</li>
            <li>used exclusively for token / ETH trades</li>
          </ul>
          <p>Once funding is complete, the bot begins trading automatically.</p>
        </Section>

        <Section title="6. Gas Usage and Automatic Top-Ups">
          <p>Because bots execute trades on-chain, they need ETH available to pay for <strong>gas</strong>.</p>
          <p>To ensure bots can always operate smoothly, Gammabots maintains a small <strong>gas reserve</strong> in your wallet:</p>
          <ul>
            <li><strong>0.00005 ETH</strong></li>
            <li>used only to pay transaction fees</li>
            <li>separate from your trading capital</li>
          </ul>
          <p>Each time you create a bot, Gammabots:</p>
          <ul>
            <li>checks your wallet's ETH balance</li>
            <li>automatically tops up gas if needed</li>
            <li>includes the top-up in the funding amount</li>
          </ul>
          <p>This means:</p>
          <ul>
            <li>bots don't fail due to insufficient gas</li>
            <li>you don't need to manage gas manually</li>
            <li>gas usage stays predictable and minimal</li>
          </ul>
        </Section>

        <Section title="7. The Bot Trades Automatically">
          <p>Once funded, the bot runs continuously in the background.</p>
          <p>It will:</p>
          <ul>
            <li>monitor the market</li>
            <li>execute buys and sells when conditions are met</li>
            <li>record every trade transparently</li>
          </ul>
          <p>You can always see a bot's status, recent activity, and performance directly in the app.</p>
        </Section>

        <Section title="8. The Dashboard">
          <p>The dashboard shows what's happening <strong>across Gammabots</strong>, for all users.</p>
          <p>It's designed to help you:</p>
          <ul>
            <li>understand overall market activity</li>
            <li>discover popular tokens and strategies</li>
            <li>see which bots are performing well</li>
          </ul>
          <p>The dashboard includes:</p>
          <ul>
            <li><strong>Popular Tokens</strong> — Tokens with the most activity and capital deployed across all bots.</li>
            <li><strong>Recent Activity</strong> — A live feed of recent buys and sells, showing how bots and strategies are behaving in real time.</li>
            <li><strong>Top Performers</strong> — Bots that have performed the best over recent time periods, making it easy to identify effective strategies.</li>
          </ul>
          <p>You can tap into any bot on the dashboard to inspect its configuration, view performance, or clone it to create your own bot.</p>
        </Section>

        <Section title="9. Manage Your Bots">
          <p>After a bot is running, you remain in full control.</p>
          <p>You can:</p>
          <ul>
            <li><strong>Monitor</strong> performance and trade history</li>
            <li><strong>Deactivate</strong> a bot to stop it from trading</li>
            <li><strong>Liquidate</strong> a bot to exit its position</li>
          </ul>
          <p>If the bot is <strong>not currently in a position</strong>, deactivating it returns the ETH to your wallet.</p>
          <p>If the bot <strong>has already bought the token</strong>, liquidation will:</p>
          <ul>
            <li>sell the token back into ETH</li>
            <li>return the ETH to your wallet</li>
          </ul>
          <p>Funds are always returned as <strong>ETH</strong>.</p>
        </Section>

        <Section title="10. Clone Bots and Strategies">
          <p>You can clone <strong>bots</strong> or <strong>strategies</strong>, depending on what you want to reuse.</p>

          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginTop: '24px', marginBottom: '12px' }}>
            Cloning a Bot
          </h3>
          <p>Cloning a bot creates a new bot with the same token, strategy, and parameters. The cloned bot is independent and can be funded and run separately.</p>

          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginTop: '24px', marginBottom: '12px' }}>
            Cloning a Strategy
          </h3>
          <p>Cloning a strategy creates a new, editable version of an existing strategy. Because strategies are immutable, cloning is how you make changes. The result is a new Strategy NFT you can use to create bots or share with others.</p>
        </Section>

        <Section title="Fees">
          <p>Gammabots charges a <strong>0.3% fee on all sell trades</strong>.</p>
          <p>That fee is split as follows:</p>
          <ul>
            <li><strong>75%</strong> goes to the Gammabots protocol</li>
            <li><strong>25%</strong> goes directly to the <strong>owner of the Strategy NFT</strong></li>
          </ul>
          <p>This means:</p>
          <ul>
            <li>bot operators only pay fees when a sell occurs</li>
            <li>strategy creators earn ETH when their strategies are used</li>
            <li>anyone can earn by building and sharing effective strategies</li>
          </ul>
          <p>All fees are applied transparently and consistently across bots.</p>
        </Section>

        <Section title="Built for Transparency">
          <ul>
            <li>All trades are visible</li>
            <li>Strategies are inspectable</li>
            <li>Performance is calculated consistently across bots</li>
          </ul>
          <p>There is no black box — you can always see what your bots are doing and why.</p>
        </Section>

        <Section title="Network Support">
          <p>Gammabots currently supports the <strong>Base</strong> network.</p>
          <p>Support for additional chains may be added in the future.</p>
        </Section>

        <hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', margin: '32px 0' }} />

        <p style={{ fontSize: '16px', color: '#444', lineHeight: '1.6' }}>
          To learn more about how strategies are written and shared, continue to{' '}
          <Link href="/docs/what-is-gammascript" style={{ color: '#14b8a6', textDecoration: 'none', fontWeight: '500' }}>
            What is GammaScript?
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
