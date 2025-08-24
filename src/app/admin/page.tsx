
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-4">
       <h1 className="text-2xl font-bold font-headline">Admin Dashboard</h1>
       <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">0</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Total Documents</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">0</p>
                </CardContent>
            </Card>
       </div>
    </div>
  );
}
