export const seedUsers = [
    {
        "id": "334ed1ca-a919-4dd6-bc65-470340cb4f83",
        "name": "Alexandre",
        "email": "alexandre@allo.com",
        "avatarUrl": "https://xftviaazycqjw8tn.public.blob.vercel-storage.com/avatars/avatar-1775643116019-897425430.webp",
        "role": "CUSTOMER",
        "projects": [
            {
                "id": "0a5a8aed-6868-4403-a5b3-4c54ac3c4637",
                "name": "Allo"
            }
        ]
    },
    {
        "id": "2c0448d4-5ae9-45ab-842d-48b4b3d6290c",
        "name": "Anas",
        "email": "anas@kuartz.studio",
        "avatarUrl": "/avatars/anas.png",
        "role": "ADMIN",
        "projects": []
    },
    {
        "id": "5a52efa4-e1de-44a4-85bc-0427f4154422",
        "name": "Andréa",
        "email": "hey@kuartz.studio",
        "avatarUrl": "/avatars/andrea.png",
        "role": "ADMIN",
        "projects": []
    },
    {
        "id": "685fe6e4-2815-43e3-be1b-90ac9e044149",
        "name": "Marouane",
        "email": "marouane@contentmachine.com",
        "avatarUrl": "https://xftviaazycqjw8tn.public.blob.vercel-storage.com/avatars/avatar-1775643120925-386444732.webp",
        "role": "CUSTOMER",
        "projects": [
            {
                "id": "cc7ad795-f5be-4b79-b313-dc059bfce817",
                "name": "Bonsai"
            },
            {
                "id": "def6b974-5837-4f52-a990-14e0b336defd",
                "name": "Content Machine"
            }
        ]
    },
    {
        "id": "67aaa81e-f20b-4197-ac72-fade61fd212c",
        "name": "Mehdi",
        "email": "mehdi@kuartz.studio",
        "avatarUrl": "/avatars/mehdi.png",
        "role": "ADMIN",
        "projects": []
    },
    {
        "id": "ab33dd35-9fc3-41d5-9a6a-c4179e3a568f",
        "name": "Réna",
        "email": "/",
        "avatarUrl": "https://xftviaazycqjw8tn.public.blob.vercel-storage.com/avatars/avatar-1775643123946-560108306.webp",
        "role": "CUSTOMER",
        "projects": [
            {
                "id": "1ff37708-a217-4d23-9502-8c6510bd01fe",
                "name": "Pointone"
            }
        ]
    },
    {
        "id": "c6784828-a67d-464f-8a0c-a3fc56e153c1",
        "name": "Samuel",
        "email": "samuel@bonsai.com",
        "avatarUrl": null,
        "role": "CUSTOMER",
        "projects": [
            {
                "id": "cc7ad795-f5be-4b79-b313-dc059bfce817",
                "name": "Bonsai"
            }
        ]
    }
];

export const seedProjects = [
    {
        "id": "1ff37708-a217-4d23-9502-8c6510bd01fe",
        "name": "Pointone",
        "url": "https://pointone.com/",
        "logoUrl": "/avatars/avatar-1775577677194-369341544.svg",
        "priority": 2,
        "targetDate": null,
        "createdAt": "2026-04-07T15:59:09.691Z",
        "_count": {
            "tasks": 0,
            "users": 1
        },
        "users": [
            {
                "id": "ab33dd35-9fc3-41d5-9a6a-c4179e3a568f",
                "name": "Réna",
                "email": "/",
                "avatarUrl": "https://xftviaazycqjw8tn.public.blob.vercel-storage.com/avatars/avatar-1775643123946-560108306.webp",
                "role": "CUSTOMER"
            }
        ]
    },
    {
        "id": "98f476ba-7f89-4e50-b380-53afd1683b42",
        "name": "Birdie",
        "url": null,
        "logoUrl": null,
        "priority": 2,
        "targetDate": null,
        "createdAt": "2026-04-07T15:27:58.330Z",
        "_count": {
            "tasks": 0,
            "users": 0
        },
        "users": []
    },
    {
        "id": "def6b974-5837-4f52-a990-14e0b336defd",
        "name": "Content Machine",
        "url": "https://kuartz-content-machine.framer.website/",
        "logoUrl": "https://xftviaazycqjw8tn.public.blob.vercel-storage.com/avatars/avatar-1775723279056-286038558.png",
        "priority": 0,
        "targetDate": null,
        "createdAt": "2026-04-07T15:27:58.124Z",
        "_count": {
            "tasks": 1,
            "users": 1
        },
        "users": [
            {
                "id": "685fe6e4-2815-43e3-be1b-90ac9e044149",
                "name": "Marouane",
                "email": "marouane@contentmachine.com",
                "avatarUrl": "https://xftviaazycqjw8tn.public.blob.vercel-storage.com/avatars/avatar-1775643120925-386444732.webp",
                "role": "CUSTOMER"
            }
        ]
    },
    {
        "id": "0a5a8aed-6868-4403-a5b3-4c54ac3c4637",
        "name": "Allo",
        "url": "https://withallo.com/",
        "logoUrl": "https://xftviaazycqjw8tn.public.blob.vercel-storage.com/avatars/avatar-1775643156524-533037834.ico",
        "priority": 3,
        "targetDate": null,
        "createdAt": "2026-04-07T15:27:57.918Z",
        "_count": {
            "tasks": 4,
            "users": 1
        },
        "users": [
            {
                "id": "334ed1ca-a919-4dd6-bc65-470340cb4f83",
                "name": "Alexandre",
                "email": "alexandre@allo.com",
                "avatarUrl": "https://xftviaazycqjw8tn.public.blob.vercel-storage.com/avatars/avatar-1775643116019-897425430.webp",
                "role": "CUSTOMER"
            }
        ]
    },
    {
        "id": "cc7ad795-f5be-4b79-b313-dc059bfce817",
        "name": "Bonsai",
        "url": null,
        "logoUrl": "https://xftviaazycqjw8tn.public.blob.vercel-storage.com/avatars/avatar-1775643141797-256854645.svg",
        "priority": 2,
        "targetDate": null,
        "createdAt": "2026-04-07T15:27:57.710Z",
        "_count": {
            "tasks": 4,
            "users": 2
        },
        "users": [
            {
                "id": "c6784828-a67d-464f-8a0c-a3fc56e153c1",
                "name": "Samuel",
                "email": "samuel@bonsai.com",
                "avatarUrl": null,
                "role": "CUSTOMER"
            },
            {
                "id": "685fe6e4-2815-43e3-be1b-90ac9e044149",
                "name": "Marouane",
                "email": "marouane@contentmachine.com",
                "avatarUrl": "https://xftviaazycqjw8tn.public.blob.vercel-storage.com/avatars/avatar-1775643120925-386444732.webp",
                "role": "CUSTOMER"
            }
        ]
    }
];

export const seedTasks = [
    {
        "id": "1e717ba5-2632-4fe3-bd3d-314d8de5481c",
        "projectId": "0a5a8aed-6868-4403-a5b3-4c54ac3c4637",
        "issueNumber": 10,
        "title": "Integration welcome offer",
        "description": "la version avec les tableaux est annulé entierement.",
        "status": "CANCELED",
        "priority": 0,
        "createdByUserId": "5a52efa4-e1de-44a4-85bc-0427f4154422",
        "targetDate": "2026-04-08T16:00:00.000Z",
        "createdAt": "2026-04-09T08:08:11.265Z",
        "updatedAt": "2026-04-09T08:09:46.651Z",
        "assignees": [
            {
                "taskId": "1e717ba5-2632-4fe3-bd3d-314d8de5481c",
                "userId": "5a52efa4-e1de-44a4-85bc-0427f4154422",
            }
        ],
        "tags": [
            {
                "taskId": "1e717ba5-2632-4fe3-bd3d-314d8de5481c",
                "tagId": "53478caf-c6d6-433e-a60d-456ebd2d48c5",
                "tag": {
                    "id": "53478caf-c6d6-433e-a60d-456ebd2d48c5",
                    "projectId": "def6b974-5837-4f52-a990-14e0b336defd",
                    "name": "framer",
                    "color": "#10B981"
                }
            }
        ]
    },
    {
        "id": "cd92334b-7040-4c35-85a8-f906d973b465",
        "projectId": "def6b974-5837-4f52-a990-14e0b336defd",
        "issueNumber": 9,
        "title": "terminer l'integrtion framer",
        "description": null,
        "status": "PAUSED",
        "priority": 0,
        "createdByUserId": "685fe6e4-2815-43e3-be1b-90ac9e044149",
        "targetDate": "2026-04-01T16:00:00.000Z",
        "createdAt": "2026-04-07T15:28:07.445Z",
        "updatedAt": "2026-04-09T08:28:38.828Z",
        "assignees": [
            {
                "taskId": "cd92334b-7040-4c35-85a8-f906d973b465",
                "userId": "5a52efa4-e1de-44a4-85bc-0427f4154422",
            }
        ],
        "tags": [
            {
                "taskId": "cd92334b-7040-4c35-85a8-f906d973b465",
                "tagId": "53478caf-c6d6-433e-a60d-456ebd2d48c5",
                "tag": {
                    "id": "53478caf-c6d6-433e-a60d-456ebd2d48c5",
                    "projectId": "def6b974-5837-4f52-a990-14e0b336defd",
                    "name": "framer",
                    "color": "#10B981"
                }
            }
        ]
    },
    {
        "id": "02890553-fd82-4519-b2b6-cc61a98532a4",
        "projectId": "0a5a8aed-6868-4403-a5b3-4c54ac3c4637",
        "issueNumber": 8,
        "title": "CMS phone numbers",
        "description": null,
        "status": "DONE",
        "priority": 2,
        "createdByUserId": "334ed1ca-a919-4dd6-bc65-470340cb4f83",
        "targetDate": "2026-03-31T16:00:00.000Z",
        "createdAt": "2026-04-07T15:28:07.033Z",
        "updatedAt": "2026-04-09T08:11:26.855Z",
        "assignees": [
            {
                "taskId": "02890553-fd82-4519-b2b6-cc61a98532a4",
                "userId": "5a52efa4-e1de-44a4-85bc-0427f4154422"
            }
        ],
        "tags": [
            {
                "taskId": "02890553-fd82-4519-b2b6-cc61a98532a4",
                "tagId": "f24d2267-d560-42c1-851d-3206ce49348f",
                "tag": {
                    "id": "f24d2267-d560-42c1-851d-3206ce49348f",
                    "projectId": "0a5a8aed-6868-4403-a5b3-4c54ac3c4637",
                    "name": "webflow",
                    "color": "#0EA5E9"
                }
            }
        ]
    },
    {
        "id": "326420c3-1f60-488b-a0bb-ee74cb4866b9",
        "projectId": "0a5a8aed-6868-4403-a5b3-4c54ac3c4637",
        "issueNumber": 7,
        "title": "Integration allo academy",
        "description": null,
        "status": "TODO",
        "priority": 2,
        "createdByUserId": "334ed1ca-a919-4dd6-bc65-470340cb4f83",
        "targetDate": null,
        "createdAt": "2026-04-07T15:28:06.623Z",
        "updatedAt": "2026-04-07T15:28:06.623Z",
        "assignees": [
            {
                "taskId": "326420c3-1f60-488b-a0bb-ee74cb4866b9",
                "userId": "5a52efa4-e1de-44a4-85bc-0427f4154422"
            }
        ],
        "tags": [
            {
                "taskId": "326420c3-1f60-488b-a0bb-ee74cb4866b9",
                "tagId": "f24d2267-d560-42c1-851d-3206ce49348f",
                "tag": {
                    "id": "f24d2267-d560-42c1-851d-3206ce49348f",
                    "projectId": "0a5a8aed-6868-4403-a5b3-4c54ac3c4637",
                    "name": "webflow",
                    "color": "#0EA5E9"
                }
            }
        ]
    },
    {
        "id": "2f2768a4-2e37-4738-9944-50612bf17490",
        "projectId": "0a5a8aed-6868-4403-a5b3-4c54ac3c4637",
        "issueNumber": 6,
        "title": "refonte design v2 allo academy",
        "description": "update le design par rapport aux retours fait sur le figma de TMF https://www.figma.com/design/Emk2vzlYFl2OOEJ6QLQT34/Allo-academy?node-id=84-710&t=4JJbr3BZ5N0CO1nq-1\n",
        "status": "IN_PROGRESS",
        "priority": 3,
        "createdByUserId": "334ed1ca-a919-4dd6-bc65-470340cb4f83",
        "targetDate": "2026-04-09T16:00:00.000Z",
        "createdAt": "2026-04-07T15:28:06.213Z",
        "updatedAt": "2026-04-09T08:11:40.631Z",
        "assignees": [
            {
                "taskId": "2f2768a4-2e37-4738-9944-50612bf17490",
                "userId": "67aaa81e-f20b-4197-ac72-fade61fd212c"
            }
        ],
        "tags": [
            {
                "taskId": "2f2768a4-2e37-4738-9944-50612bf17490",
                "tagId": "ef32e172-3c03-4011-96ba-2e02fa575399",
                "tag": {
                    "id": "ef32e172-3c03-4011-96ba-2e02fa575399",
                    "projectId": "0a5a8aed-6868-4403-a5b3-4c54ac3c4637",
                    "name": "design",
                    "color": "#A855F7"
                }
            }
        ]
    },
    {
        "id": "c1c3b2c9-17f0-4472-b60e-100ffb2b4d8b",
        "projectId": "cc7ad795-f5be-4b79-b313-dc059bfce817",
        "issueNumber": 5,
        "title": "Website integration",
        "description": null,
        "status": "BACKLOG",
        "priority": 0,
        "createdByUserId": "67aaa81e-f20b-4197-ac72-fade61fd212c",
        "targetDate": null,
        "createdAt": "2026-04-07T15:28:05.801Z",
        "updatedAt": "2026-04-07T15:28:05.801Z",
        "assignees": [
            {
                "taskId": "c1c3b2c9-17f0-4472-b60e-100ffb2b4d8b",
                "userId": "5a52efa4-e1de-44a4-85bc-0427f4154422"
            }
        ],
        "tags": [
            {
                "taskId": "c1c3b2c9-17f0-4472-b60e-100ffb2b4d8b",
                "tagId": "53478caf-c6d6-433e-a60d-456ebd2d48c5",
                "tag": {
                    "id": "53478caf-c6d6-433e-a60d-456ebd2d48c5",
                    "projectId": "def6b974-5837-4f52-a990-14e0b336defd",
                    "name": "framer",
                    "color": "#10B981"
                }
            }
        ]
    },
    {
        "id": "08004d3b-8426-4b27-a966-c61974557051",
        "projectId": "cc7ad795-f5be-4b79-b313-dc059bfce817",
        "issueNumber": 3,
        "title": "Website design",
        "description": null,
        "status": "TODO",
        "priority": 0,
        "createdByUserId": "c6784828-a67d-464f-8a0c-a3fc56e153c1",
        "targetDate": null,
        "createdAt": "2026-04-07T15:28:04.972Z",
        "updatedAt": "2026-04-09T08:13:28.183Z",
        "assignees": [
            {
                "taskId": "08004d3b-8426-4b27-a966-c61974557051",
                "userId": "67aaa81e-f20b-4197-ac72-fade61fd212c"
            }
        ],
        "tags": [
            {
                "taskId": "08004d3b-8426-4b27-a966-c61974557051",
                "tagId": "ef32e172-3c03-4011-96ba-2e02fa575399",
                "tag": {
                    "id": "ef32e172-3c03-4011-96ba-2e02fa575399",
                    "projectId": "0a5a8aed-6868-4403-a5b3-4c54ac3c4637",
                    "name": "design",
                    "color": "#A855F7"
                }
            }
        ]
    },
    {
        "id": "984c2b1a-717c-4f2a-a5f5-60cc96d52e8c",
        "projectId": "cc7ad795-f5be-4b79-b313-dc059bfce817",
        "issueNumber": 2,
        "title": "Send contract",
        "description": null,
        "status": "DONE",
        "priority": 0,
        "createdByUserId": "67aaa81e-f20b-4197-ac72-fade61fd212c",
        "targetDate": "2026-04-04T16:00:00.000Z",
        "createdAt": "2026-04-07T15:28:04.557Z",
        "updatedAt": "2026-04-07T16:52:22.115Z",
        "assignees": [
            {
                "taskId": "984c2b1a-717c-4f2a-a5f5-60cc96d52e8c",
                "userId": "2c0448d4-5ae9-45ab-842d-48b4b3d6290c"
            }
        ],
        "tags": [
            {
                "taskId": "984c2b1a-717c-4f2a-a5f5-60cc96d52e8c",
                "tagId": "505e67c2-56b8-4deb-9813-21a3d6a17211",
                "tag": {
                    "id": "505e67c2-56b8-4deb-9813-21a3d6a17211",
                    "projectId": "cc7ad795-f5be-4b79-b313-dc059bfce817",
                    "name": "commercial",
                    "color": "#0EA5E9"
                }
            }
        ]
    },
    {
        "id": "5ba36b27-f642-43d1-9106-872d1d7f941d",
        "projectId": "cc7ad795-f5be-4b79-b313-dc059bfce817",
        "issueNumber": 1,
        "title": "Brand design",
        "description": null,
        "status": "IN_PROGRESS",
        "priority": 2,
        "createdByUserId": "c6784828-a67d-464f-8a0c-a3fc56e153c1",
        "targetDate": null,
        "createdAt": "2026-04-07T15:28:04.145Z",
        "updatedAt": "2026-04-09T08:13:54.188Z",
        "assignees": [
            {
                "taskId": "5ba36b27-f642-43d1-9106-872d1d7f941d",
                "userId": "67aaa81e-f20b-4197-ac72-fade61fd212c"
            }
        ],
        "tags": [
            {
                "taskId": "5ba36b27-f642-43d1-9106-872d1d7f941d",
                "tagId": "cf9207bc-ac0e-4d29-bfed-8fa63cfba1ce",
                "tag": {
                    "id": "cf9207bc-ac0e-4d29-bfed-8fa63cfba1ce",
                    "projectId": "cc7ad795-f5be-4b79-b313-dc059bfce817",
                    "name": "brand",
                    "color": "#84CC16"
                }
            }
        ]
    }
];
