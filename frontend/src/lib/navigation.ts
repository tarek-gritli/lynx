import { History, LayoutDashboard, Settings } from "lucide-react";

export const ROUTES = {
	DASHBOARD: "/dashboard",
	HISTORY: "/history",
	REVIEW_DETAIL: (reviewId: number) => `/history/${reviewId}`,
	SETTINGS: "/settings",
	LANDING: "/landing",
};

export const navMain = [
	{
		title: "Dashboard",
		url: ROUTES.DASHBOARD,
		icon: LayoutDashboard,
		isActive: true,
	},
	{
		title: "Review History",
		url: ROUTES.HISTORY,
		icon: History,
	},
	{
		title: "Settings",
		url: ROUTES.SETTINGS,
		icon: Settings,
	},
];
