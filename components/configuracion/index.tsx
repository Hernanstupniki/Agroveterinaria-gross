"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Bell,
  Shield,
  Mail,
  Save,
  Users,
  Stethoscope,
  Syringe,
  Scissors,
  FlaskConical,
} from "lucide-react"
import { profesionales, configuracion } from "@/lib/mock-data"
import { SectionHeader } from "@/components/shared/section-header"
import { LargePrimaryAction } from "@/components/shared/large-primary-action"

export default function ConfiguracionScreen() {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1500)
  }

  return (
    <div className="animate-section-in mx-auto max-w-[1600px] space-y-6">
      <SectionHeader
        title="Configuración"
        description="Administrá el equipo, los datos clínicos y la seguridad del sistema."
        action={
          <LargePrimaryAction
            label={isSaving ? "Guardando..." : "Guardar cambios"}
            icon={Save}
            onClick={handleSave}
          />
        }
      />

      <Tabs defaultValue="usuarios" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="usuarios">
            <Users className="mr-2 h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="clinica">
            <Stethoscope className="mr-2 h-4 w-4" />
            Clínica
          </TabsTrigger>
          <TabsTrigger value="notificaciones">
            <Bell className="mr-2 h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="seguridad">
            <Shield className="mr-2 h-4 w-4" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Equipo Veterinario</CardTitle>
                <CardDescription>Administre los usuarios del sistema</CardDescription>
              </div>
              <Button variant="outline">
                <User className="mr-2 h-4 w-4" />
                Agregar Usuario
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profesionales.map((profesional) => (
                  <div key={profesional.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                        {profesional.nombre.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium">{profesional.nombre}</p>
                        <p className="text-sm text-muted-foreground">{profesional.especialidad}</p>
                        <p className="text-sm text-muted-foreground">{profesional.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Activo</Badge>
                      <Badge variant="outline">{profesional.rol}</Badge>
                      <Button variant="ghost" size="sm">Editar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Roles y Permisos</CardTitle>
              <CardDescription>Configure los permisos de cada rol</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { role: "Administrador", permissions: ["Todas las funciones", "Configuración del sistema", "Gestión de usuarios"] },
                  { role: "Veterinario", permissions: ["Gestión de pacientes", "Historia clínica", "Turnos", "Tratamientos"] },
                  { role: "Recepcionista", permissions: ["Gestión de turnos", "Clientes", "Recordatorios"] },
                  { role: "Auxiliar", permissions: ["Ver pacientes", "Actualizar estado"] },
                ].map((item) => (
                  <div key={item.role} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{item.role}</h4>
                      <Button variant="ghost" size="sm">Configurar</Button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.permissions.map((perm) => (
                        <Badge key={perm} variant="secondary">{perm}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificaciones" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificaciones del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Nuevos turnos</p>
                    <p className="text-sm text-muted-foreground">Notificar cuando se agende un turno</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Cancelaciones</p>
                    <p className="text-sm text-muted-foreground">Notificar cancelaciones de turnos</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Vacunas vencidas</p>
                    <p className="text-sm text-muted-foreground">Alertar sobre vacunas próximas a vencer</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Controles pendientes</p>
                    <p className="text-sm text-muted-foreground">Alertar sobre controles clínicos próximos</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Configuración de Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Servidor SMTP</Label>
                  <Input defaultValue="smtp.gmail.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Puerto</Label>
                    <Input defaultValue="587" />
                  </div>
                  <div className="space-y-2">
                    <Label>Seguridad</Label>
                    <Select defaultValue="tls">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tls">TLS</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                        <SelectItem value="none">Ninguna</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email del remitente</Label>
                  <Input defaultValue="notificaciones@agroveterinariagross.com" />
                </div>
                <Button variant="outline" className="w-full">Probar Conexión</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clinica" className="space-y-4">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Datos de la clínica
              </CardTitle>
              <CardDescription>Información general de Agroveterinaria Gross.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input defaultValue={configuracion.veterinaria.nombre} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input defaultValue={configuracion.veterinaria.telefono} />
              </div>
              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input defaultValue={configuracion.veterinaria.direccion} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={configuracion.veterinaria.email} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Horarios de atención</Label>
                <Input defaultValue={configuracion.veterinaria.horarios} />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <TypesCard icon={Syringe} title="Tipos de vacunas" items={configuracion.tiposVacunas} />
            <TypesCard icon={FlaskConical} title="Tipos de estudios" items={configuracion.tiposEstudios} />
            <TypesCard icon={Scissors} title="Tipos de cirugías" items={configuracion.tiposCirugia} />
          </div>
        </TabsContent>

        <TabsContent value="seguridad" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Seguridad de la Cuenta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Cambiar Contraseña</Label>
                  <Input type="password" placeholder="Contraseña actual" />
                </div>
                <div className="space-y-2">
                  <Input type="password" placeholder="Nueva contraseña" />
                </div>
                <div className="space-y-2">
                  <Input type="password" placeholder="Confirmar nueva contraseña" />
                </div>
                <Button variant="outline" className="w-full">Actualizar Contraseña</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Autenticación de Dos Factores</CardTitle>
                <CardDescription>Añada una capa extra de seguridad</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Habilitar 2FA</p>
                    <p className="text-sm text-muted-foreground">Requiere código al iniciar sesión</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sesiones activas</p>
                    <p className="text-sm text-muted-foreground">2 dispositivos conectados</p>
                  </div>
                  <Button variant="outline" size="sm">Ver sesiones</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Copias de Seguridad</CardTitle>
                <CardDescription>Configure las copias de seguridad automáticas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Backup automático diario</p>
                    <p className="text-sm text-muted-foreground">Última copia: hace 2 horas</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex gap-4">
                  <Button variant="outline">
                    Hacer Backup Ahora
                  </Button>
                  <Button variant="outline">
                    Restaurar Backup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TypesCard({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof Syringe
  title: string
  items: string[]
}) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge key={item} variant="secondary" className="rounded-lg">
              {item}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
