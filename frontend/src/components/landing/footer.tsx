const FOOTER_LINKS = ["Privacy", "Terms", "Security", "Status"];

export function Footer() {
	return (
		<footer className="border-t border-border py-12 bg-background">
			<div className="mx-auto max-w-300 px-6 flex flex-col md:flex-row justify-between items-center gap-8">
				<span className="flex items-center gap-3">
					<strong className="text-lg tracking-tighter">LYNX</strong>
				</span>
				<nav className="flex gap-8 text-sm text-muted-foreground">
					{FOOTER_LINKS.map((link) => (
						<button
							key={link}
							type="button"
							className="hover:text-white transition-colors"
						>
							{link}
						</button>
					))}
				</nav>
				<small className="text-xs text-muted-foreground/60">
					© 2026 Lynx. All rights reserved.
				</small>
			</div>
		</footer>
	);
}
