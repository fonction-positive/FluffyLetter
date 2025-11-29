import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Favorites from '../views/Favorites.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/favorites',
        name: 'Favorites',
        component: Favorites,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
