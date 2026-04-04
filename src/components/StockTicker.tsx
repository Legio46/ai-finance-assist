const tickerItems = [
  { sym: "AAPL", price: "$189.42", change: "▲ 1.24%", up: true },
  { sym: "BTC", price: "$64,210", change: "▲ 2.87%", up: true },
  { sym: "TSLA", price: "$246.18", change: "▼ 0.43%", up: false },
  { sym: "S&P 500", price: "5,218.31", change: "▲ 0.72%", up: true },
  { sym: "NVDA", price: "$812.55", change: "▲ 3.10%", up: true },
  { sym: "ETH", price: "$3,480", change: "▼ 1.20%", up: false },
  { sym: "MSFT", price: "$415.30", change: "▲ 0.55%", up: true },
  { sym: "GOLD", price: "$2,341", change: "▲ 0.18%", up: true },
];

const StockTicker = () => {
  const items = [...tickerItems, ...tickerItems];
  
  return (
    <div className="relative z-20 overflow-hidden whitespace-nowrap py-2.5" 
      style={{ 
        background: 'rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
      <div className="inline-flex gap-12 animate-ticker">
        {items.map((item, idx) => (
          <span key={idx} className="inline-flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.45)', flexShrink: 0 }}>
            <span className="font-medium" style={{ color: 'rgba(255,255,255,0.8)', letterSpacing: '0.4px' }}>{item.sym}</span>
            {item.price}
            <span className={item.up ? 'text-emerald-400' : 'text-red-400'}>{item.change}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default StockTicker;
