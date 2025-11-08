import React from 'react';

type Props = { children: React.ReactNode };

type State = { hasError: boolean; message?: string };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any): State {
    return { hasError: true, message: (error && (error.message || String(error))) };
  }
  componentDidCatch(error: any, errorInfo: any) {
    try { console.error('App ErrorBoundary', error, errorInfo); } catch {}
  }
  handleRetry = () => {
    try { this.setState({ hasError: false, message: undefined }); }
    catch {}
  };
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight:'100vh', background:'#0a0a0b', color:'#fff', display:'grid', placeItems:'center', padding:16 }}>
          <div style={{ width:'min(92vw, 560px)', textAlign:'center' }}>
            <h1 className="font-display" style={{ fontSize: 24, marginBottom: 8 }}>Etwas ist schiefgelaufen</h1>
            <p style={{ opacity: 0.85, marginBottom: 16 }}>Bitte versuche es erneut. Wenn das Problem bestehen bleibt, lade die Seite neu.</p>
            {this.state.message && (
              <pre aria-hidden style={{ textAlign:'left', whiteSpace:'pre-wrap', wordBreak:'break-word', opacity:0.7, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', padding:12, borderRadius:10, marginBottom: 16 }}>{this.state.message}</pre>
            )}
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button onClick={this.handleRetry} className="pressable" style={{ padding:'10px 16px', borderRadius:10, background:'linear-gradient(135deg, #7F5CFF, #D34DFF)', color:'#fff', border:'1px solid rgba(255,255,255,0.16)' }}>Erneut versuchen</button>
              <button onClick={() => { try { window.location.reload(); } catch {} }} className="pressable" style={{ padding:'10px 16px', borderRadius:10, background:'rgba(255,255,255,0.10)', color:'#fff', border:'1px solid rgba(255,255,255,0.18)' }}>Neu laden</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
