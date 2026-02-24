"use client";

import { Link, useLocation } from "@tanstack/react-router";
import type * as React from "react";
import { NavUser } from "@/components/navigation/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import { navMain, ROUTES } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export default function AppSidebar({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	const location = useLocation();

	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link to={ROUTES.DASHBOARD} className="flex items-center gap-3">
								<div className="flex aspect-square items-center justify-center rounded-lg text-primary-foreground">
									<img src="/lynx.png" alt="Lynx logo" className="size-15" />
								</div>
								<div className="flex flex-col gap-0.5 leading-none">
									<span className="font-semibold">Lynx</span>
									<span className="text-xs text-muted-foreground">
										Code Reviews
									</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarSeparator />
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{navMain.map((item) => {
								const isActive =
									location.pathname === item.url ||
									location.pathname.startsWith(`${item.url}/`);
								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											tooltip={item.title}
											className={cn(
												"text-gray-400 hover:text-primary hover:bg-primary/10",
												isActive && "bg-primary/10 text-primary",
											)}
										>
											<Link to={item.url}>
												{item.icon && (
													<item.icon className="size-4 group-data-[collapsible=icon]:size-5" />
												)}
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
