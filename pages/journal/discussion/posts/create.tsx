import { useRouter } from 'next/router'
import Form from '../../../../components/Journal/Discussion/PostForm'

export default function Create() {
    const router = useRouter()

    return (
        <Form slug={router.query.post} />
    )
}