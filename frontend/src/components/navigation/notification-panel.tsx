import { Bell, CheckCircle, XCircle, CheckCheck } from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "@/components/ui/sheet";
import type { Notification } from "@/hooks/use-notifications";
import { useState } from "react";
import { cn, formatTime } from "@/lib/utils";

interface NotificationPanelProps {
	notifications: Notification[];
	unreadCount: number;
	markAsRead: (id: number) => void;
	markAllAsRead: () => void;
}

export function NotificationBell({
	notifications,
	unreadCount,
	markAsRead,
	markAllAsRead,
}: NotificationPanelProps) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="relative inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
			>
				<Bell className="size-5" />
				{unreadCount > 0 && (
					<span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
						{unreadCount > 9 ? "9+" : unreadCount}
					</span>
				)}
				<span className="sr-only">Notifications</span>
			</button>

			<Sheet open={open} onOpenChange={setOpen}>
				<SheetContent side="right" className="flex flex-col p-0">
					<SheetHeader className="border-b px-4 py-3">
						<div className="flex items-center justify-between">
							<SheetTitle className="text-base">Notifications</SheetTitle>
							{notifications.length > 0 && (
								<div className="flex items-center gap-1">
									{unreadCount > 0 && (
										<button
											type="button"
											onClick={markAllAsRead}
											className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
										>
											<CheckCheck className="size-3.5" />
											Mark all read
										</button>
									)}
								</div>
							)}
						</div>
						<SheetDescription className="sr-only">
							Review notifications
						</SheetDescription>
					</SheetHeader>

					<div className="flex-1 overflow-y-auto">
						{notifications.length === 0 ? (
							<div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
								<Bell className="size-8 opacity-40" />
								<p className="text-sm">No notifications yet</p>
							</div>
						) : (
							<ul className="divide-y divide-border">
								{notifications.map((n) => (
									<NotificationItem
										key={n.id}
										notification={n}
										onRead={() => markAsRead(n.id)}
									/>
								))}
							</ul>
						)}
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
}

function NotificationItem({
	notification: n,
	onRead,
}: { notification: Notification; onRead: () => void }) {
	const isSuccess = n.type === "review_success";

	return (
		<li
			className={cn(
				"flex gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-muted/50",
				!n.read && "bg-primary/5",
			)}
			onClick={onRead}
			onKeyDown={(e) => e.key === "Enter" && onRead()}
		>
			<div
				className={cn(
					"mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
					isSuccess ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive",
				)}
			>
				{isSuccess ? (
					<CheckCircle className="size-4" />
				) : (
					<XCircle className="size-4" />
				)}
			</div>
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium">
					{isSuccess ? "Review completed" : "Review failed"}
				</p>
				<p className="text-xs text-muted-foreground truncate">
					{n.repo_name}#{n.pr_number} &middot; {n.provider}
				</p>
				{!isSuccess && n.error && (
					<p className="text-xs text-destructive/80 truncate">{n.error}</p>
				)}
				<time className="text-[11px] text-muted-foreground/60">
					{formatTime(n.created_at)}
				</time>
			</div>
			{!n.read && (
				<span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
			)}
		</li>
	);
}


