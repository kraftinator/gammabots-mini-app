'use client'

interface LegalModalProps {
  type: 'terms' | 'privacy' | 'support' | null
  onClose: () => void
}

export default function LegalModal({ type, onClose }: LegalModalProps) {
  if (!type) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #f2f2f7',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          borderRadius: '16px 16px 0 0'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1c1c1e',
            margin: 0
          }}>
            {type === 'terms' ? 'Terms of Service' : type === 'privacy' ? 'Privacy Policy' : 'Support'}
          </h2>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#8e8e93',
              padding: '4px',
              lineHeight: '1'
            }}
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px', fontSize: '14px', lineHeight: '1.6', color: '#1c1c1e' }}>
          {type === 'support' ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ marginBottom: '16px' }}>For support, send a DM to:</p>
              <p style={{ fontSize: '18px', fontWeight: '700', color: '#7c65c1', marginBottom: '16px' }}>@kraft</p>
              <p style={{ fontSize: '12px', color: '#8e8e93' }}>We'll get back to you as soon as possible.</p>
            </div>
          ) : type === 'terms' ? (
            <>
              <p style={{ color: '#8e8e93', fontSize: '12px', marginTop: 0, marginBottom: '16px' }}>Last updated: November 26, 2025</p>

              <p style={{ marginBottom: '12px' }}>Please read these Terms of Service ("Terms") carefully before using Gammabots ("the Service"). By signing up or using the Service, you agree to these Terms.</p>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>1. Overview</h3>
              <p>Gammabots is an autonomous crypto-trading application that lets users deploy algorithmic trading bots. The Service creates a dedicated trading wallet for each user and executes trades according to user-selected strategies.</p>
              <p>Gammabots is not a broker, exchange, custodian, or investment advisor. It is a software interface for automated trading.</p>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>2. Eligibility</h3>
              <p style={{ marginBottom: '8px' }}>To use Gammabots, you must:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '12px', listStyleType: 'disc' }}>
                <li>be at least 18 years old</li>
                <li>have a valid Farcaster account</li>
                <li>comply with local laws regarding digital asset trading</li>
              </ul>
              <p>You are responsible for ensuring that your use of the Service is legal in your jurisdiction.</p>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>3. Non-Custodial Wallets</h3>
              <p style={{ marginBottom: '8px' }}>When you sign up, the Service generates a dedicated trading wallet ("Bot Wallet") for your account.</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '12px', listStyleType: 'disc' }}>
                <li>You control the wallet through your Gammabots account.</li>
                <li>The Service does not take custody of your funds.</li>
                <li>You authorize the Service to submit transactions from the Bot Wallet on your behalf for the purpose of executing trades.</li>
              </ul>
              <p style={{ marginBottom: '8px' }}>You acknowledge that:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '12px', listStyleType: 'disc' }}>
                <li>private keys exist on the server</li>
                <li>loss of access or compromise of the service may impact your Bot Wallet</li>
                <li>you should not store large long-term balances in the Bot Wallet</li>
              </ul>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>4. No Financial Advice</h3>
              <p style={{ marginBottom: '8px' }}>Gammabots does not provide investment, financial, tax, or legal advice. Nothing in the Service:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '12px', listStyleType: 'disc' }}>
                <li>is a recommendation to buy, sell, or hold digital assets</li>
                <li>should be interpreted as financial advice</li>
                <li>guarantees profits or protection from losses</li>
              </ul>
              <p>You make all trading decisions entirely at your own risk.</p>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>5. Trading Risks</h3>
              <p style={{ marginBottom: '8px' }}>Crypto trading carries significant risk, including:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '12px', listStyleType: 'disc' }}>
                <li>volatile price movements</li>
                <li>partial or total loss of funds</li>
                <li>smart contract failures</li>
                <li>network congestion</li>
                <li>MEV, slippage, and sandwich attacks</li>
                <li>third-party API failures</li>
                <li>incorrect or unexpected bot behavior</li>
              </ul>
              <p style={{ marginBottom: '8px' }}>You agree that:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '12px', listStyleType: 'disc' }}>
                <li>You are solely responsible for all trades executed by your bots.</li>
                <li>You understand and accept these risks.</li>
                <li>Gammabots is not liable for any losses.</li>
              </ul>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>6. Autonomous Trading Bots</h3>
              <p style={{ marginBottom: '8px' }}>When using automated bots:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '12px', listStyleType: 'disc' }}>
                <li>You authorize Gammabots to programmatically execute trades from your Bot Wallet.</li>
                <li>You understand that bot logic is deterministic and may not behave as expected in all market conditions.</li>
                <li>You are responsible for monitoring your bot's activity and disabling it if you no longer wish to trade.</li>
              </ul>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>7. No Guarantees</h3>
              <p style={{ marginBottom: '8px' }}>The Service is provided "as is" and "as available." We do not guarantee:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '12px', listStyleType: 'disc' }}>
                <li>uptime</li>
                <li>successful execution of trades</li>
                <li>profitability</li>
                <li>accuracy of market data</li>
                <li>uninterrupted access to the Service</li>
              </ul>
              <p>You assume complete responsibility for your trading decisions and use of bots.</p>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>8. Fees</h3>
              <p>Gammabots may charge fees on trades. Fees will be displayed in the UI or documentation and may change over time.</p>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>9. Prohibited Use</h3>
              <p style={{ marginBottom: '8px' }}>You may not:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '12px', listStyleType: 'disc' }}>
                <li>use the Service for illegal activity</li>
                <li>attempt to bypass security controls</li>
                <li>spam or abuse trading APIs</li>
                <li>exploit bugs for financial gain</li>
                <li>reverse engineer the service</li>
              </ul>
              <p>Violation may result in termination of your access.</p>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>10. Limitation of Liability</h3>
              <p style={{ marginBottom: '8px' }}>To the fullest extent permitted by law:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '12px', listStyleType: 'disc' }}>
                <li>Gammabots, its developers, and contributors are not liable for any indirect, incidental, special, or consequential damages.</li>
                <li>Gammabots is not responsible for loss of funds, trading losses, system errors, smart contract failures, or unauthorized access.</li>
              </ul>
              <p>Your sole remedy for issues with the Service is to stop using it.</p>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>11. Indemnification</h3>
              <p>You agree to indemnify and hold harmless Gammabots and its developers from any claims, damages, or losses arising from your use of the Service.</p>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>12. Data & Privacy</h3>
              <p style={{ marginBottom: '8px' }}>Gammabots stores:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '12px', listStyleType: 'disc' }}>
                <li>your Farcaster ID</li>
                <li>your Bot Wallet</li>
                <li>trading history</li>
                <li>bot configuration and performance metrics</li>
              </ul>
              <p>We do not sell user data. We may use anonymized usage data to improve the Service.</p>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>13. Account Termination</h3>
              <p style={{ marginBottom: '8px' }}>We may suspend or terminate your access if:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '12px', listStyleType: 'disc' }}>
                <li>you violate these Terms</li>
                <li>your actions threaten the integrity of the Service</li>
                <li>required by law</li>
              </ul>
              <p>You may stop using the Service at any time.</p>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>14. Changes to These Terms</h3>
              <p>We may update these Terms at any time. Continued use of the Service constitutes acceptance of the updated Terms.</p>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>15. Contact</h3>
              <p>If you have questions, contact:<br/>@kraft</p>
            </>
          ) : (
            <>
              <p style={{ color: '#8e8e93', fontSize: '12px', marginTop: 0, marginBottom: '16px' }}>Last updated: November 26, 2025</p>

              <p style={{ marginBottom: '12px' }}>Your privacy matters. This Privacy Policy explains what information Gammabots ("we", "us", "our") collects, how we use it, and your rights regarding that data.</p>

              <p style={{ marginBottom: '12px' }}>By using Gammabots, you agree to the practices described here.</p>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>1. Information We Collect</h3>
              <p>We collect only what is required to operate the Service.</p>

              <h4 style={{ fontSize: '15px', fontWeight: '600', marginTop: '20px', marginBottom: '10px' }}>1.1 Farcaster Identity</h4>
              <p style={{ marginBottom: '8px' }}>When you sign in using Farcaster, we receive:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '12px', listStyleType: 'disc' }}>
                <li>Your Farcaster ID (FID)</li>
                <li>Your Farcaster username</li>
                <li>Your Farcaster profile image URL</li>
                <li>Your public wallet address</li>
              </ul>
              <p>We do not receive your private keys, Farcaster password, or custodial wallet keys.</p>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h4 style={{ fontSize: '15px', fontWeight: '600', marginTop: '20px', marginBottom: '10px' }}>1.2 Bot Wallet Data</h4>
              <p>When you sign up, we generate a dedicated trading wallet for your account.</p>
              <p style={{ marginBottom: '8px' }}>We store:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '12px', listStyleType: 'disc' }}>
                <li>The Bot Wallet's public address</li>
                <li>The encrypted private key (server-side, used to perform automated trades)</li>
              </ul>
              <p>We do not sell, share, or expose this information.</p>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h4 style={{ fontSize: '15px', fontWeight: '600', marginTop: '20px', marginBottom: '10px' }}>1.3 Trading Activity and Bot Configuration</h4>
              <p style={{ marginBottom: '8px' }}>To operate automated bots, we store:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '12px', listStyleType: 'disc' }}>
                <li>Strategies you select</li>
                <li>Bot configuration values</li>
                <li>Trading history</li>
                <li>Profit/loss metrics</li>
                <li>On-chain transaction hashes</li>
                <li>Token balances in your Bot Wallet</li>
              </ul>
              <p style={{ marginBottom: '8px' }}>We do not store:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '12px', listStyleType: 'disc' }}>
                <li>Your external wallet balances</li>
                <li>Your other on-chain activity not related to Gammabots</li>
              </ul>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h4 style={{ fontSize: '15px', fontWeight: '600', marginTop: '20px', marginBottom: '10px' }}>1.4 Usage Data (Minimal Analytics)</h4>
              <p style={{ marginBottom: '8px' }}>We may collect basic, anonymized analytics, such as:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '12px', listStyleType: 'disc' }}>
                <li>API request counts</li>
                <li>Error logs</li>
                <li>Bot uptime statistics</li>
                <li>App performance metrics</li>
              </ul>
              <p>We do not use third-party trackers, ad networks, cookies, or fingerprinting.</p>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h4 style={{ fontSize: '15px', fontWeight: '600', marginTop: '20px', marginBottom: '10px' }}>1.5 Optional Information You Provide</h4>
              <p style={{ marginBottom: '8px' }}>If you contact support, we may collect:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '12px', listStyleType: 'disc' }}>
                <li>Your email</li>
                <li>Details about your issue</li>
                <li>Diagnostic information you voluntarily provide</li>
              </ul>
              <p>We do not store unnecessary personal data.</p>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>2. How We Use Your Information</h3>
              <p style={{ marginBottom: '8px' }}>We use your data only to:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '12px', listStyleType: 'disc' }}>
                <li>Authenticate your identity using Farcaster</li>
                <li>Create and manage your Bot Wallet</li>
                <li>Execute automated trades you authorize</li>
                <li>Display your bot activity and performance</li>
                <li>Provide support and communicate updates</li>
                <li>Improve app reliability and performance</li>
              </ul>
              <p style={{ marginBottom: '8px' }}>We do NOT:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '12px', listStyleType: 'disc' }}>
                <li>Sell user data</li>
                <li>Monetize your personal information</li>
                <li>Use your data for advertising</li>
                <li>Share your data with unrelated third parties</li>
              </ul>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>3. How We Protect Your Data</h3>
              <p style={{ marginBottom: '8px' }}>We use industry-standard technical and organizational measures, including:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '12px', listStyleType: 'disc' }}>
                <li>Encrypted storage of Bot Wallet private keys</li>
                <li>Access control and audit logging</li>
                <li>HTTPS for all API communication</li>
                <li>Server-level environment isolation</li>
                <li>Rate limiting and security monitoring</li>
              </ul>
              <p>No system is perfect; you acknowledge that the Service involves inherent risks related to digital asset management.</p>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>4. Data Sharing</h3>
              <p>We may share minimal data only when necessary:</p>

              <h4 style={{ fontSize: '15px', fontWeight: '600', marginTop: '20px', marginBottom: '10px' }}>4.1 Service Providers</h4>
              <p>We may use trusted providers to run servers, store logs, or process analytics. These providers only access data as needed to operate the app.</p>

              <h4 style={{ fontSize: '15px', fontWeight: '600', marginTop: '20px', marginBottom: '10px' }}>4.2 Legal Requirements</h4>
              <p style={{ marginBottom: '8px' }}>We may disclose information if required:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '12px', listStyleType: 'disc' }}>
                <li>by law or regulation</li>
                <li>to comply with subpoenas or court orders</li>
                <li>to prevent fraud or malicious activity</li>
              </ul>
              <p>We will never voluntarily sell or transfer your personal data.</p>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>5. Your Rights</h3>
              <p style={{ marginBottom: '8px' }}>Depending on your jurisdiction, you may have the right to:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '12px', listStyleType: 'disc' }}>
                <li>Access the data we store about you</li>
                <li>Request correction or deletion</li>
                <li>Opt out of analytics</li>
                <li>Stop using the Service at any time</li>
              </ul>
              <p>To exercise these rights, email us at @kraft.</p>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>6. Data Retention</h3>
              <p style={{ marginBottom: '8px' }}>We retain:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: '12px', listStyleType: 'disc' }}>
                <li>Bot Wallets and trading data for as long as your account is active</li>
                <li>Logs and analytics for a limited period</li>
                <li>Deleted user data only as required by law or for security purposes</li>
              </ul>
              <p>If you request account deletion, we will disable your bots and stop executing trades. Your Bot Wallet will remain accessible for future withdrawals, and its keys will remain securely stored.</p>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>7. Children's Privacy</h3>
              <p>We do not knowingly offer the Service to individuals under 18. If you believe a minor is using Gammabots, contact us for removal.</p>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>8. International Data Transfers</h3>
              <p>Data may be stored or processed in the United States or other countries. By using the Service, you consent to these transfers.</p>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>9. Changes to This Policy</h3>
              <p>We may update this Privacy Policy from time to time. If we make significant changes, we will notify users within the app. Continued use of the Service constitutes acceptance of updated policies.</p>

              <div style={{ borderTop: '1px solid #e5e5e7', margin: '20px 0' }}></div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>10. Contact Us</h3>
              <p>For questions or privacy concerns:<br/>@kraft</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
