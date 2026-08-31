import { getCategorias } from "@/lib/negocios";
import UneteForm from "@/components/UneteForm";

export const revalidate = 60;

export default async function UnetePage() {
  const categorias = await getCategorias();

  return (
    <>
      <div className="hero">
        <div className="eyebrow">PARA NEGOCIOS LOCALES</div>
        <h1 className="title">
          Afíliate
          <br />
          ya.
        </h1>
        <p className="intro">
          Crea un minisitio para que tus clientes encuentren tu menú, ubicación, teléfono
          y todo lo que necesitan para visitarte.
        </p>
      </div>

      <section className="section">
        <div className="head">
          <h2>¿Cómo funciona?</h2>
        </div>
        <div className="steps">
          <div className="step">
            <div className="step-num">01</div>
            <div>
              <div className="step-name">Cuéntanos de tu negocio</div>
              <div className="step-desc">Llena el formulario de abajo con tus datos básicos de contacto.</div>
            </div>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <div>
              <div className="step-name">Arrancas con prueba gratuita</div>
              <div className="step-desc">Tu minisitio queda listo y visible mientras decides si te quedas.</div>
            </div>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <div>
              <div className="step-name">Te contactamos</div>
              <div className="step-desc">Te mostramos los paquetes y addons opcionales para tu negocio.</div>
            </div>
          </div>
        </div>
      </section>

      <div className="trial-note">
        <strong>Empiezas gratis.</strong> No pedimos tarjeta ni pagos por adelantado — al enviar tu
        solicitud comienza tu prueba gratuita y después te contactamos con los detalles.
      </div>

      <UneteForm categorias={categorias} />
    </>
  );
}
