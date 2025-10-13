/* eslint-disable @next/next/no-img-element */
"use client"
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
 
export default function NotFound() {
    const router = useRouter();
    return (
        <div className='absolute inset-0 flex flex-col items-center justify-center gap-4 p-4'>
            <h2 className='font-bold'>404 Not Found</h2>
            <img src="https://www.shutterstock.com/image-illustration/smiley-worker-wheelbarrow-260nw-125026571.jpg" alt="404" />
            <p>coba cek lagi urlnya masbro</p>
            <Button variant={"link"} onClick={() => (router.push('/'))}>Return Home</Button>
        </div>
    )
}