import AppLayout from '@/layout/AppLayout.vue';
import {createRouter, createWebHistory} from 'vue-router';
import {useAuthStore} from '../stores';


const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                }, {
                    path: '/pages/saima-agent',
                    name: 'saima-agent',
                    component: () => import('@/views/SaimaAgentView.vue')
                }, {
                    path: '/pages/dictionaries/user',
                    name: 'user',
                    component: () => import('@/views/dictionaries/User.vue')
                }, {
                    path: '/pages/alga-process',
                    name: 'alga-process',
                    component: () => import('@/views/AlgaProcess.vue')
                }, {
                    path: '/pages/subscriber-stage',
                    name: 'subscriber-stage',
                    component: () => import('@/views/SubscriberStage.vue')
                }, {
                    path: '/pages/e-sim',
                    name: 'e-sim',
                    component: () => import('@/views/ESim.vue')
                }, {
                    path: '/pages/education',
                    name: 'education',
                    component: () => import('@/views/Education.vue')
                }, {
                    path: '/pages/sim-recovery',
                    name: 'sim-recovery',
                    component: () => import('@/views/SimRecovery.vue')
                }, {
                    path: '/pages/dictionaries/registrar',
                    name: 'registrar',
                    component: () => import('@/views/dictionaries/Registrar.vue')
                }, {
                    path: '/pages/dictionaries/organization',
                    name: 'organization',
                    component: () => import('@/views/dictionaries/Organization.vue')
                }, {
                    path: '/pages/dictionaries/mobileVersion',
                    name: 'mobileVersion',
                    component: () => import('@/views/dictionaries/MobileVersion.vue')
                }, {
                    path: '/pages/dictionaries/connection-data',
                    name: 'connectionData',
                    component: () => import('@/views/dictionaries/ConnectionData.vue')
                }, {
                    path: '/pages/dictionaries/organization-channel-types',
                    name: 'organizationChannelType',
                    component: () => import('@/views/dictionaries/OrganizationChannelType.vue')
                }, {
                    path: '/pages/dictionaries/role',
                    name: 'role',
                    component: () => import('@/views/dictionaries/Role.vue')
                }, {
                    path: '/pages/dictionaries/registrar-role',
                    name: 'registrarRole',
                    component: () => import('@/views/dictionaries/RegistrarRole.vue')
                },
                {
                    path: '/pages/dictionaries/region',
                    name: 'region',
                    component: () => import('@/views/dictionaries/Region.vue')
                },
                {
                    path: '/pages/dictionaries/simRecoveryRejectReason',
                    name: 'simRecoveryRejectReason',
                    component: () => import('@/views/dictionaries/SimRecoveryRejectReason.vue')
                },
                {
                    path: '/pages/dictionaries/eSimRejectReason',
                    name: 'eSimRejectReason',
                    component: () => import('@/views/dictionaries/EsimRejectReason.vue')
                },
                {
                    path: '/pages/dictionaries/eduRejectReason',
                    name: 'eduRejectReason',
                    component: () => import('@/views/dictionaries/EduRejectReason.vue')
                },
                {
                    path: '/pages/dictionaries/saimaTemplate',
                    name: 'saimaTemplate',
                    component: () => import('@/views/dictionaries/SaimaTemplate.vue')
                },
                {
                    path: '/pages/dictionaries/saimaTemplateCategory',
                    name: 'saimaTemplateCategory',
                    component: () => import('@/views/dictionaries/SaimaTemplateCategory.vue')
                },{
                    path: '/pages/dictionaries/personificationTemplate',
                    name: 'personificationTemplate',
                    component: () => import('@/views/dictionaries/PersonificationTemplate.vue')
                },{
                    path: '/pages/dictionaries/personificationTemplateCategory',
                    name: 'personificationTemplateCategory',
                    component: () => import('@/views/dictionaries/PersonificationTemplateCategory.vue')
                },{
                    path: '/pages/dictionaries/personificationRejectReason',
                    name: 'personificationRejectReason',
                    component: () => import('@/views/dictionaries/PersonificationRejectReason.vue')
                },{
                    path: '/pages/dictionaries/verificationRejectReason',
                    name: 'verificationRejectReason',
                    component: () => import('@/views/dictionaries/VerificationRejectReason.vue')
                }, {
                    path: '/pages/personification',
                    name: 'subscriber',
                    component: () => import('@/views/subscriber/Subscriber.vue')
                },
                {
                    path: '/pages/personification/edit/:id',
                    name: 'subscriber-edit',
                    component: () => import('@/views/subscriber/SubscriberEdit.vue'),
                    props: true
                },
                {
                    path: '/pages/personification/view/:id',
                    name: 'subscriber-view',
                    component: () => import('@/views/subscriber/SubscriberEdit.vue'),
                    props: true
                },
                {
                    path: '/pages/dictionaries/tariffPlan',
                    name: 'tariffPlan',
                    component: () => import('@/views/dictionaries/TariffPlan.vue')
                },
                {
                    path: '/pages/dictionaries/giftSimCard',
                    name: 'giftSimCard',
                    component: () => import('@/views/dictionaries/GiftSimCard.vue')
                },
                {
                    path: '/pages/dictionaries/bonusProperty',
                    name: 'bonusProperty',
                    component: () => import('@/views/dictionaries/BonusProperty.vue')
                },
                {
                    path: '/pages/dictionaries/operationConfig',
                    name: 'operationConfig',
                    component: () => import('@/views/dictionaries/OperationConfig.vue')
                },
                {
                    path: '/pages/dictionaries/operationConfigLogs',
                    name: 'operationConfigLogs',
                    component: () => import('@/views/dictionaries/OperationConfigLogs.vue')
                },
                {
                    path: '/pages/statistic/processed-operation',
                    name: 'processedOperation',
                    component: () => import('@/views/statistics/ProcessedOperation.vue')
                }
            ]
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/auth/NotFound.vue')
        },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/auth/Login.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/auth/Error.vue')
        }
    ]
});

router.beforeEach(async (to: any) => {
    // redirect to login page if not logged in and trying to access a restricted page
    const publicPages = ['/auth/login'];
    const authRequired = !publicPages.includes(to.path);
    const authStore = useAuthStore();


    if (authRequired && !authStore.user) {
        return {
            path: '/auth/login',
            query: {returnUrl: to.href}
        };
    }
});


export default router;
