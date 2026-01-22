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
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.5',
    marginBottom: '24px',
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
    listStyleType: 'disc',
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

export default function HowItWorksPage() {
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
        <h1 style={styles.title}>How Gammabots Works</h1>
      </div>

      <div style={styles.content}>
        <div style={styles.card}>
          <p style={styles.intro}>
            Gammabots lets you deploy automated trading bots in seconds — without managing infrastructure or watching charts all day.
          </p>
          <p style={styles.intro}>
            Each bot follows a simple, transparent lifecycle.
          </p>

          <hr style={styles.divider} />

          <h2 style={styles.h2}>1. Your Gammabots Wallet</h2>
          <p style={styles.p}>
            When you sign up for Gammabots, a dedicated wallet is created for you.
          </p>
          <p style={styles.p}>This wallet:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>is used exclusively to run your bots</li>
            <li style={styles.li}>holds the ETH you allocate to bots</li>
            <li style={styles.li}>executes trades according to the strategies you choose</li>
          </ul>
          <p style={styles.p}>
            You don't need to manage private keys or sign every trade. Gammabots handles execution, while your funds remain associated with your wallet.
          </p>

          <hr style={styles.divider} />

          <h2 style={styles.h2}>2. Choose a Token</h2>
          <p style={styles.p}>
            You start by choosing the token you want the bot to trade.
          </p>
          <p style={styles.p}>
            All bots on Gammabots trade <strong style={styles.strong}>token / ETH pairs</strong>.
          </p>
          <p style={styles.p}>This means:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>bots are funded with <strong style={styles.strong}>ETH</strong></li>
            <li style={styles.li}>tokens are bought and sold <strong style={styles.strong}>against ETH</strong></li>
            <li style={styles.li}>performance, profits, and balances are always measured in <strong style={styles.strong}>ETH</strong></li>
          </ul>

          <hr style={styles.divider} />

          <h2 style={styles.h2}>3. Choose a Strategy</h2>
          <p style={styles.p}>
            Strategies define <strong style={styles.strong}>how</strong> the bot trades.
          </p>
          <p style={styles.p}>A strategy specifies:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>when the bot buys</li>
            <li style={styles.li}>when it sells</li>
            <li style={styles.li}>how it reacts to price movements</li>
          </ul>
          <p style={styles.p}>
            All strategies on Gammabots are written in <strong style={styles.strong}>Gammascript</strong>, a purpose-built language for automated trading logic.
          </p>
          <p style={styles.p}>You can create strategies in several ways:</p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong style={styles.strong}>Write Gammascript directly</strong> for full control</li>
            <li style={styles.li}><strong style={styles.strong}>Use the Strategy Builder</strong> to construct strategies visually, without writing code</li>
            <li style={styles.li}><strong style={styles.strong}>Clone existing strategies</strong> and tweak their logic or parameters</li>
          </ul>
          <p style={styles.p}>
            Strategies are fully transparent and inspectable. You can always see exactly what a strategy does before using it.
          </p>

          <h3 style={styles.h3}>Strategies Are NFTs</h3>
          <p style={styles.p}>
            Each strategy is minted as an <strong style={styles.strong}>NFT</strong>.
          </p>
          <p style={styles.p}>
            Strategies are <strong style={styles.strong}>immutable</strong> once created — their logic cannot be changed. This guarantees that every bot using a strategy is running the exact same code.
          </p>
          <p style={styles.p}>If you want to modify a strategy, you simply:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>clone it</li>
            <li style={styles.li}>make your changes</li>
            <li style={styles.li}>mint it as a new strategy NFT</li>
          </ul>
          <p style={styles.p}>
            This allows strategies to evolve over time while preserving trust and reproducibility.
          </p>

          <hr style={styles.divider} />

          <h2 style={styles.h2}>4. Configure the Bot</h2>
          <p style={styles.p}>To configure a bot, you set four things:</p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong style={styles.strong}>Token Address</strong> — The contract address of the token you want the bot to trade.</li>
            <li style={styles.li}><strong style={styles.strong}>ETH Amount</strong> — The amount of ETH the bot will use as its trading capital.</li>
            <li style={styles.li}><strong style={styles.strong}>Strategy</strong> — The strategy that defines how the bot buys and sells.</li>
            <li style={styles.li}><strong style={styles.strong}>Moving Average</strong> — A strategy parameter (in minutes) that controls how the bot reacts to price changes.</li>
          </ul>
          <p style={styles.p}>
            Once these are set, click <strong style={styles.strong}>Create Bot</strong> and confirm the transaction in your wallet.
          </p>

          <hr style={styles.divider} />

          <h2 style={styles.h2}>5. Fund the Bot</h2>
          <p style={styles.p}>
            After confirming in your wallet, the bot is funded with ETH.
          </p>
          <p style={styles.p}>That ETH is sent to your <strong style={styles.strong}>Gammabots wallet</strong> and is:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>reserved for this bot</li>
            <li style={styles.li}>controlled by the selected strategy</li>
            <li style={styles.li}>used exclusively for token / ETH trades</li>
          </ul>
          <p style={styles.p}>
            Once funding is complete, the bot begins trading automatically.
          </p>

          <hr style={styles.divider} />

          <h2 style={styles.h2}>6. Gas Usage and Automatic Top-Ups</h2>
          <p style={styles.p}>
            Because bots execute trades on-chain, they need ETH available to pay for <strong style={styles.strong}>gas</strong>.
          </p>
          <p style={styles.p}>
            To ensure bots can always operate smoothly, Gammabots maintains a small <strong style={styles.strong}>gas reserve</strong> in your wallet:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong style={styles.strong}>0.00005 ETH</strong></li>
            <li style={styles.li}>used only to pay transaction fees</li>
            <li style={styles.li}>separate from your trading capital</li>
          </ul>
          <p style={styles.p}>Each time you create a bot, Gammabots:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>checks your wallet's ETH balance</li>
            <li style={styles.li}>automatically tops up gas if needed</li>
            <li style={styles.li}>includes the top-up in the funding amount</li>
          </ul>
          <p style={styles.p}>This means:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>bots don't fail due to insufficient gas</li>
            <li style={styles.li}>you don't need to manage gas manually</li>
            <li style={styles.li}>gas usage stays predictable and minimal</li>
          </ul>

          <hr style={styles.divider} />

          <h2 style={styles.h2}>7. The Bot Trades Automatically</h2>
          <p style={styles.p}>
            Once funded, the bot runs continuously in the background.
          </p>
          <p style={styles.p}>It will:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>monitor the market</li>
            <li style={styles.li}>execute buys and sells when conditions are met</li>
            <li style={styles.li}>record every trade transparently</li>
          </ul>
          <p style={styles.p}>
            You can always see a bot's status, recent activity, and performance directly in the app.
          </p>

          <hr style={styles.divider} />

          <h2 style={styles.h2}>8. The Dashboard</h2>
          <p style={styles.p}>
            The dashboard shows what's happening <strong style={styles.strong}>across Gammabots</strong>, for all users.
          </p>
          <p style={styles.p}>It's designed to help you:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>understand overall market activity</li>
            <li style={styles.li}>discover popular tokens and strategies</li>
            <li style={styles.li}>see which bots are performing well</li>
          </ul>
          <p style={styles.p}>The dashboard includes:</p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong style={styles.strong}>Popular Tokens</strong> — Tokens with the most activity and capital deployed across all bots.</li>
            <li style={styles.li}><strong style={styles.strong}>Recent Activity</strong> — A live feed of recent buys and sells, showing how bots and strategies are behaving in real time.</li>
            <li style={styles.li}><strong style={styles.strong}>Top Performers</strong> — Bots that have performed the best over recent time periods, making it easy to identify effective strategies.</li>
          </ul>
          <p style={styles.p}>
            You can tap into any bot on the dashboard to inspect its configuration, view performance, or clone it to create your own bot.
          </p>

          <hr style={styles.divider} />

          <h2 style={styles.h2}>9. Manage Your Bots</h2>
          <p style={styles.p}>
            After a bot is running, you remain in full control.
          </p>
          <p style={styles.p}>You can:</p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong style={styles.strong}>Monitor</strong> performance and trade history</li>
            <li style={styles.li}><strong style={styles.strong}>Deactivate</strong> a bot to stop it from trading</li>
            <li style={styles.li}><strong style={styles.strong}>Liquidate</strong> a bot to exit its position</li>
          </ul>
          <p style={styles.p}>
            If the bot is <strong style={styles.strong}>not currently in a position</strong>, deactivating it returns the ETH to your wallet.
          </p>
          <p style={styles.p}>
            If the bot <strong style={styles.strong}>has already bought the token</strong>, liquidation will:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}>sell the token back into ETH</li>
            <li style={styles.li}>return the ETH to your wallet</li>
          </ul>
          <p style={styles.p}>
            Funds are always returned as <strong style={styles.strong}>ETH</strong>.
          </p>

          <hr style={styles.divider} />

          <h2 style={styles.h2}>10. Clone Bots and Strategies</h2>
          <p style={styles.p}>
            You can clone <strong style={styles.strong}>bots</strong> or <strong style={styles.strong}>strategies</strong>, depending on what you want to reuse.
          </p>
          <h3 style={styles.h3}>Cloning a Bot</h3>
          <p style={styles.p}>
            Cloning a bot creates a new bot with the same token, strategy, and parameters. The cloned bot is independent and can be funded and run separately.
          </p>
          <h3 style={styles.h3}>Cloning a Strategy</h3>
          <p style={styles.p}>
            Cloning a strategy creates a new, editable version of an existing strategy. Because strategies are immutable, cloning is how you make changes. The result is a new Strategy NFT you can use to create bots or share with others.
          </p>

          <hr style={styles.divider} />

          <h2 style={styles.h2}>Fees</h2>
          <p style={styles.p}>
            Gammabots charges a <strong style={styles.strong}>0.3% fee on all sell trades</strong>.
          </p>
          <p style={styles.p}>That fee is split as follows:</p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong style={styles.strong}>75%</strong> goes to the Gammabots protocol</li>
            <li style={styles.li}><strong style={styles.strong}>25%</strong> goes directly to the <strong style={styles.strong}>owner of the Strategy NFT</strong></li>
          </ul>
          <p style={styles.p}>This means:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>bot operators only pay fees when a sell occurs</li>
            <li style={styles.li}>strategy creators earn ETH when their strategies are used</li>
            <li style={styles.li}>anyone can earn by building and sharing effective strategies</li>
          </ul>
          <p style={styles.p}>
            All fees are applied transparently and consistently across bots.
          </p>

          <hr style={styles.divider} />

          <h2 style={styles.h2}>Built for Transparency</h2>
          <ul style={styles.ul}>
            <li style={styles.li}>All trades are visible</li>
            <li style={styles.li}>Strategies are inspectable</li>
            <li style={styles.li}>Performance is calculated consistently across bots</li>
          </ul>
          <p style={styles.p}>
            There is no black box — you can always see what your bots are doing and why.
          </p>

          <hr style={styles.divider} />

          <h2 style={styles.h2}>Network Support</h2>
          <p style={styles.p}>
            Gammabots currently supports the <strong style={styles.strong}>Base</strong> network.
          </p>
          <p style={styles.p}>
            Support for additional chains may be added in the future.
          </p>

          <hr style={styles.divider} />

          <p style={styles.p}>
            To learn more about how strategies are written and shared, continue to{' '}
            <a onClick={() => router.push('/docs/what-is-gammascript')} style={styles.link}>
              What is Gammascript?
            </a>
          </p>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}
