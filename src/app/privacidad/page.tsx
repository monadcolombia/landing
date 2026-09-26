import Link from "next/link";

export const metadata = {
  title: "Política de Privacidad - Monad Tour Colombia",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-monad-dark py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-block text-sm text-white/50 hover:text-white font-mono mb-8 transition-colors"
        >
          &larr; Volver al inicio
        </Link>

        <h1 className="text-4xl font-bold text-white mb-2">Política de Privacidad</h1>
        <p className="text-white/50 text-sm font-mono mb-12">Última actualización: Mayo 2026</p>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Marco Legal y Responsable</h2>
            <p>
              Esta politica se rige por la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia
              sobre proteccion de datos personales. El responsable del tratamiento de datos es
              Medellin Blockchain Community, organizador de los eventos MonadBlitz Hackathon en
              Colombia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Consentimiento</h2>
            <p>
              Al enviar un formulario de registro o postulacion en este sitio, autorizas de manera
              libre, previa, expresa e informada el tratamiento de tus datos personales conforme a
              los fines descritos en esta politica. Puedes retirar tu consentimiento en cualquier
              momento contactando al equipo organizador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Informacion que Recopilamos</h2>
            <p>
              Al registrarte al hackathon o postularte como mentor, jurado o voluntario, recopilamos
              la siguiente informacion:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1">
              <li>Nombre completo</li>
              <li>Correo electrónico</li>
              <li>Número de teléfono (opcional)</li>
              <li>Perfiles de redes sociales: LinkedIn, Twitter/X, Instagram (opcionales)</li>
              <li>Ciudad de participación</li>
              <li>
                Información profesional relacionada con tu postulación (habilidades, experiencia,
                bio)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Uso de la Informacion</h2>
            <p>Utilizamos tu información personal para:</p>
            <ul className="list-disc list-inside mt-3 space-y-1">
              <li>Gestionar tu registro y participación en los eventos MonadBlitz</li>
              <li>Evaluar postulaciones de mentores, jurados y voluntarios</li>
              <li>Comunicarnos contigo sobre el evento (logística, actualizaciones, resultados)</li>
              <li>Mejorar la organización de futuros eventos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Compartir Informacion</h2>
            <p>
              No vendemos, alquilamos ni compartimos tu información personal con terceros con fines
              comerciales. Podemos compartir información con:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1">
              <li>
                Organizadores y patrocinadores del evento, solo lo necesario para la logística
              </li>
              <li>Proveedores de servicios que nos ayudan a operar el evento</li>
              <li>Autoridades cuando sea requerido por ley</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              6. Almacenamiento, Seguridad y Retencion
            </h2>
            <p>
              Tu informacion se almacena en servidores seguros. Implementamos medidas de seguridad
              tecnicas y organizativas para proteger tus datos contra acceso no autorizado, perdida
              o alteracion.
            </p>
            <p className="mt-3">
              Conservamos tus datos personales durante un periodo maximo de 12 meses despues del
              ultimo evento en el que participaste. Pasado este periodo, los datos seran eliminados
              de forma segura, salvo que exista una obligacion legal que requiera su conservacion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Tus Derechos</h2>
            <p>
              De acuerdo con la Ley 1581 de 2012 (articulos 15 y 16), como titular de los datos
              tienes derecho a:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1">
              <li>Conocer, actualizar y rectificar tu informacion personal</li>
              <li>
                Solicitar la eliminacion de tus datos cuando no exista obligacion legal de
                conservarlos
              </li>
              <li>Revocar la autorizacion otorgada para el tratamiento de tus datos</li>
              <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC)</li>
            </ul>
            <p className="mt-3">
              Para ejercer estos derechos, contacta al equipo organizador a traves de nuestras redes
              sociales oficiales o en los canales de Discord de Monad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Cookies</h2>
            <p>
              Este sitio utiliza cookies esenciales para su funcionamiento (como la sesion de
              administracion). No utilizamos cookies de seguimiento ni publicidad de terceros. Al
              aceptar el banner de cookies, consientes el uso de estas cookies esenciales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              9. Fotografia y Contenido del Evento
            </h2>
            <p>
              Durante los eventos MonadBlitz se pueden tomar fotografías y videos. Al asistir al
              evento, aceptas que tu imagen pueda aparecer en materiales promocionales y redes
              sociales del evento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Cambios a esta Politica</h2>
            <p>
              Nos reservamos el derecho de actualizar esta política de privacidad. Los cambios serán
              publicados en esta página con la fecha de actualización correspondiente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Contacto</h2>
            <p>
              Si tienes preguntas sobre esta politica de privacidad o deseas ejercer tus derechos
              como titular de datos, puedes contactarnos a traves de nuestras redes sociales
              oficiales o en los canales de Discord de Monad.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
