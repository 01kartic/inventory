"use client"

import * as React from "react"
import { Database, Scan, Users, UserPlus, ShoppingCart, Plus, Stack, User, SignOut, HardDrives } from "@phosphor-icons/react";

import { usePathname } from "next/navigation"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSubButton,
    SidebarSeparator,
    SidebarFooter,
} from "./ui/sidebar"
import { useEffect, useState } from "react";

const data = {
    navContent: [
        {
            title: "Dashboard",
            url: "/admin/dashboard",
            icon: Scan,
            isActive: false,
        },
        {
            title: "Customers",
            url: "/admin/customers",
            subURL: "/admin/customers/edit",
            icon: Users,
            isActive: false,
        },
        {
            sub: true,
            title: "Make Bill",
            url: "/admin/customers/add",
            icon: UserPlus,
            isActive: false,
        },
        {
            title: "Products",
            url: "/admin/products",
            subURL: "/admin/products/edit",
            icon: ShoppingCart,
            isActive: false,
        },
        {
            sub: true,
            title: "Add Product",
            url: "/admin/products/add",
            icon: Plus,
            isActive: false,
        },
        {
            title: "Stocks",
            url: "/admin/stocks",
            subURL: "/admin/stocks/edit",
            icon: Stack,
            isActive: false,
        },
        {
            sub: true,
            title: "Add Stock",
            url: "/admin/stocks/add",
            icon: Plus,
            isActive: false,
        },
    ],
    navFooter: [
        {
            title: "Export Data",
            url: "/admin/export",
            icon: HardDrives,
            isActive: false,
        },
        {
            title: "Profile",
            url: "/admin/profile",
            icon: User,
            isActive: false,
        }
    ],
}

export function AppSidebar({
    ...props
}) {
    const pathname = usePathname();
    const [navContent, setNavContent] = useState(data.navContent);
    const [navFooter, setNavFooter] = useState(data.navFooter);

    useEffect(() => {
        setNavContent(data.navContent.map(item => ({
            ...item,
            isActive: item.url === pathname || item.subURL === pathname
        })));

        setNavFooter(data.navFooter.map(item => ({
            ...item,
            isActive: item.url === pathname
        })));
    }, [pathname]);

    return (
        (<Sidebar className="border-r-0" {...props}>
            <SidebarHeader>
                <a href="/" className="flex items-center gap-2 px-3 py-0.5 lg:py-1.5">
                    <Database size={24} weight="fill" className="fill-primary" />
                    <p className="font-bold text-xl text-primary">Inventory</p>
                </a>
            </SidebarHeader>
            <SidebarSeparator className="m-0 p-0" />
            <SidebarContent>
                <SidebarMenu className="p-3 gap-2">
                    {navContent.map((item, index) => (
                        item.sub ? (
                            <SidebarMenuItem key={index}>
                                <SidebarMenuSubButton asChild isActive={item.isActive}>
                                    <a href={item.url}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </a>
                                </SidebarMenuSubButton>
                            </SidebarMenuItem>
                        ) :
                            (<SidebarMenuItem key={index}>
                                <SidebarMenuButton asChild isActive={item.isActive}>
                                    <a href={item.url}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>)
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarSeparator className="m-0 p-0" />
            <SidebarFooter>
                <SidebarMenu className="lg:p-2 gap-2">
                    {navFooter.map((item, index) => (
                        <SidebarMenuItem key={index}>
                            <SidebarMenuButton asChild isActive={item.isActive}>
                                <a href={item.url}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    <SidebarMenuItem key='logout'>
                        <SidebarMenuButton variant="destructive" asChild>
                            <div onClick={
                                () => {
                                    localStorage.removeItem("isChief");
                                    window.location.href = "/";
                                }
                            }>
                                <SignOut />
                                <span>Logout</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>)
    );
}