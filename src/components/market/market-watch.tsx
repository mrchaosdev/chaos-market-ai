const marketRows = [
  { symbol: "BTCUSDT", price: "112,481.32", change: "+2.31%", score: "72 / 100" },
  { symbol: "ETHUSDT", price: "4,284.10", change: "+1.18%", score: "64 / 100" },
  { symbol: "BNBUSDT", price: "872.44", change: "-0.42%", score: "51 / 100" },
];

export function MarketWatch() {
  return (
    <div className="border border-border bg-background">
      <div className="border-b border-border p-4">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Market Watch</p>
      </div>
      <div className="divide-y divide-border">
        {marketRows.map((row) => (
          <div className="grid grid-cols-4 gap-3 p-4 font-mono text-xs tabular" key={row.symbol}>
            <span>{row.symbol}</span>
            <span>{row.price}</span>
            <span className={row.change.startsWith("+") ? "text-positive" : "text-negative"}>{row.change}</span>
            <span className="text-muted-foreground">{row.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
