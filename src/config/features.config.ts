export type Feature = {
    /** Key inside the `landing` messages namespace */
    title: string;
    /** Key inside the `landing` messages namespace */
    desc: string;
    /** Iconify name, e.g. "mdi:database-plus" */
    icon: string;
    /** Illustration shown on top of the card (public/ path or full URL) */
    image: string;
};

export const features: Feature[] = [
    {
        title: "features.feature1.title",
        desc: "features.feature1.desc",
        icon: "mdi:database-plus",
        image: "/features/feature1.svg",
    },
    {
        title: "features.feature2.title",
        desc: "features.feature2.desc",
        icon: "mdi:cloud-sync-outline",
        image: "/features/feature2.svg",
    },
    {
        title: "features.feature3.title",
        desc: "features.feature3.desc",
        icon: "mdi:account-lock-outline",
        image: "/features/feature3.svg",
    },
    {
        title: "features.feature4.title",
        desc: "features.feature4.desc",
        icon: "mdi:monitor-dashboard",
        image: "/features/feature4.svg",
    },
    {
        title: "features.feature5.title",
        desc: "features.feature5.desc",
        icon: "mdi:robot-outline",
        image: "/features/feature5.svg",
    },
    {
        title: "features.feature6.title",
        desc: "features.feature6.desc",
        icon: "mdi:chart-line",
        image: "/features/feature6.svg",
    },
];
