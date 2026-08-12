import { PageHead } from "../components/shared";

// You can easily edit these rules in the future by changing the text inside the quotation marks!
const TOURNAMENT_RULES = [
  {
    title: "1. Base Match Points",
    description: "A team is awarded two (2) points for securing a victory in a match. Zero (0) points are awarded for a loss."
  },
  {
    title: "2. Bonus Points System",
    description: "A winning team may earn one (1) additional bonus point if they achieve victory by a specified point margin. The required margins to secure a bonus point are:\n• Table Tennis: 6-point margin\n• Badminton: 4-point margin\n• Lawn Tennis: 25-point margin\nIf a team wins but does not meet this margin, no bonus points are awarded."
  },
  {
    title: "3. Official Scoring Systems",
    description: "• Table Tennis: Matches are played up to eleven (11) points.\n• Lawn Tennis: Standard scoring applies up to the forty (40) point mark (game point), with the subsequent point securing the win.\n• Badminton: Matches are played to twenty-one (21) points. In the event of a 29-29 tie, a strict 30-point cap applies (the first team to reach 30 points wins)."
  }
];

export default function Rules() {
  return (
    <div className="min-h-screen">
      <PageHead label="Official Regulations" title="LEAGUE RULES" accent="#22C55E" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 space-y-6">
        <div className="card-tech rounded-2xl p-8 sm:p-12 border border-white/10">
          <div className="space-y-8">
            {TOURNAMENT_RULES.map((rule, index) => (
              <div key={index} className="border-b border-white/10 pb-6 last:border-0 last:pb-0 animate-fade-in-up" style={{ animationDelay: \`\${index * 100}ms\` }}>
                <h3 className="font-display text-2xl text-[#22C55E] mb-3">{rule.title}</h3>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-line">{rule.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
