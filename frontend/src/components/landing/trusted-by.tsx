import { Box, Cloud, Hexagon, Shield } from "lucide-react";

const COMPANIES = [
	{ icon: Hexagon, name: "SYNERGY" },
	{ icon: Box, name: "DEVCORE" },
	{ icon: Shield, name: "SECURE.IO" },
	{ icon: Cloud, name: "NIMBUS" },
];

export function TrustedBy() {
	return (
		<section className="mt-32 text-center">
			<p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em] mb-12">
				Trusted by teams at
			</p>
			<ul className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
				{COMPANIES.map(({ icon: Icon, name }) => (
					<li key={name} className="flex items-center gap-2">
						<Icon className="w-5 h-5" />
						<span className="text-xl font-bold">{name}</span>
					</li>
				))}
			</ul>
		</section>
	);
}
