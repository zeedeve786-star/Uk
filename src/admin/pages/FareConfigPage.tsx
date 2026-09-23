import { useEffect, useState } from 'react';
import { fareConfigApi } from '../api/adminService';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import styles from './FareConfigPage.module.css';

type FormState = {
  currency: string;
  baseFarePence: string;
  perMilePence: string;
  perExtraStopPence: string;
  minimumFarePence: string;
  saloonMultiplier: string;
  estateMultiplier: string;
  mpvMultiplier: string;
  executiveMultiplier: string;
  eightSeaterMultiplier: string;
  driverEarningRuleType: 'NONE' | 'FIXED' | 'PERCENTAGE';
  driverEarningValue: string;
  companyChargePence: string;
  companyChargePercentage: string;
};

export function FareConfigPage() {
  const [config, setConfig] = useState<any>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fareConfigApi.get();
      setConfig(result);
      setForm({
        currency: result.currency,
        baseFarePence: String(result.baseFarePence),
        perMilePence: String(result.perMilePence),
        perExtraStopPence: String(result.perExtraStopPence),
        minimumFarePence: String(result.minimumFarePence),
        saloonMultiplier: String(result.vehicleMultipliers.saloon),
        estateMultiplier: String(result.vehicleMultipliers.estate),
        mpvMultiplier: String(result.vehicleMultipliers.mpv),
        executiveMultiplier: String(result.vehicleMultipliers.executive),
        eightSeaterMultiplier: String(result.vehicleMultipliers['eight-seater']),
        driverEarningRuleType: result.driverEarningRuleType,
        driverEarningValue:
          result.driverEarningValue == null ? '' : String(result.driverEarningValue),
        companyChargePence:
          result.companyChargePence == null ? '' : String(result.companyChargePence),
        companyChargePercentage:
          result.companyChargePercentage == null
            ? ''
            : String(result.companyChargePercentage),
      });
    } catch (err: any) {
      setError(
        err?.message || 'Unable to load fare configuration.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => current ? { ...current, [key]: value } : current);
  };

  const numberOrUndefined = (value: string) =>
    value.trim() === '' ? undefined : Number(value);

  const handleSave = async () => {
    if (!form) return;

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const updated = await fareConfigApi.update({
        currency: form.currency,
        baseFarePence: Number(form.baseFarePence),
        perMilePence: Number(form.perMilePence),
        perExtraStopPence: Number(form.perExtraStopPence),
        minimumFarePence: Number(form.minimumFarePence),
        vehicleMultipliers: {
          saloon: Number(form.saloonMultiplier),
          estate: Number(form.estateMultiplier),
          mpv: Number(form.mpvMultiplier),
          executive: Number(form.executiveMultiplier),
          'eight-seater': Number(form.eightSeaterMultiplier),
        },
        driverEarningRuleType: form.driverEarningRuleType,
        driverEarningValue: numberOrUndefined(form.driverEarningValue),
        companyChargePence: numberOrUndefined(form.companyChargePence),
        companyChargePercentage: numberOrUndefined(form.companyChargePercentage),
      } as any);

      setConfig(updated);
      setMessage('Fare configuration saved successfully.');
    } catch (err: any) {
      setError(
        err?.message || 'Unable to save fare configuration.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error && !form) return <Alert tone="error">{error}</Alert>;
  if (!form) return <Alert tone="error">Unable to load fare configuration.</Alert>;

  const field = (
    label: string,
    key: keyof FormState,
    step = '1',
  ) => (
    <label className={styles.field}>
      <span>{label}</span>
      <input
        type="number"
        step={step}
        value={form[key]}
        onChange={(e) => update(key, e.target.value)}
      />
    </label>
  );

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div>
          <div className={styles.eyebrow}>
            <span className={styles.liveDot} />
            PRICING / FARE ENGINE
          </div>

          <h1 className={styles.heading}>Fare Control</h1>

          <p className={styles.description}>
            Configure the pricing rules used by the transport booking engine,
            vehicle classes and driver earning model.
          </p>
        </div>

        <div className={styles.heroMeta}>
          <span>PRICING CURRENCY</span>
          <strong>{form.currency}</strong>
          <small>Current fare configuration</small>
        </div>
      </div>

      {message && <Alert tone="success">{message}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      <div className={styles.engineGrid}>
        <Card className={`${styles.sectionCard} ${styles.baseCard}`}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionKicker}>01 / CORE PRICING</span>
              <h2>Base fare rules</h2>
            </div>
            <div className={styles.sectionIcon}>£</div>
          </div>

          <div className={styles.details}>
            <label className={styles.field}>
              <span>Currency</span>
              <input
                value={form.currency}
                onChange={(e) => update('currency', e.target.value)}
              />
            </label>

            {field('Base fare (pence)', 'baseFarePence')}
            {field('Per mile (pence)', 'perMilePence')}
            {field('Extra stop (pence)', 'perExtraStopPence')}
            {field('Minimum fare (pence)', 'minimumFarePence')}
          </div>
        </Card>

        <Card className={`${styles.sectionCard} ${styles.vehicleCard}`}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionKicker}>02 / VEHICLE PRICING</span>
              <h2>Vehicle multipliers</h2>
            </div>
            <div className={styles.sectionIcon}>×</div>
          </div>

          <div className={styles.vehicleList}>
            <div className={styles.vehicleRow}>
              <span className={styles.vehicleNumber}>01</span>
              <div><strong>Saloon</strong><small>Standard class</small></div>
              <div className={styles.vehicleInput}>{field('Multiplier', 'saloonMultiplier', '0.01')}</div>
            </div>

            <div className={styles.vehicleRow}>
              <span className={styles.vehicleNumber}>02</span>
              <div><strong>Estate</strong><small>Extra luggage capacity</small></div>
              <div className={styles.vehicleInput}>{field('Multiplier', 'estateMultiplier', '0.01')}</div>
            </div>

            <div className={styles.vehicleRow}>
              <span className={styles.vehicleNumber}>03</span>
              <div><strong>MPV</strong><small>Group travel</small></div>
              <div className={styles.vehicleInput}>{field('Multiplier', 'mpvMultiplier', '0.01')}</div>
            </div>

            <div className={styles.vehicleRow}>
              <span className={styles.vehicleNumber}>04</span>
              <div><strong>Executive</strong><small>Premium travel</small></div>
              <div className={styles.vehicleInput}>{field('Multiplier', 'executiveMultiplier', '0.01')}</div>
            </div>

            <div className={styles.vehicleRow}>
              <span className={styles.vehicleNumber}>05</span>
              <div><strong>8-Seater</strong><small>Large group travel</small></div>
              <div className={styles.vehicleInput}>{field('Multiplier', 'eightSeaterMultiplier', '0.01')}</div>
            </div>
          </div>
        </Card>

        <Card className={`${styles.sectionCard} ${styles.earningCard}`}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionKicker}>03 / DRIVER ECONOMICS</span>
              <h2>Driver earning</h2>
            </div>
            <div className={styles.sectionIcon}>%</div>
          </div>

          <div className={styles.details}>
            <label className={styles.field}>
              <span>Rule</span>
              <select
                value={form.driverEarningRuleType}
                onChange={(e) =>
                  update(
                    'driverEarningRuleType',
                    e.target.value as FormState['driverEarningRuleType'],
                  )
                }
              >
                <option value="NONE">None</option>
                <option value="FIXED">Fixed (pence)</option>
                <option value="PERCENTAGE">Percentage</option>
              </select>
            </label>

            {field('Driver earning value', 'driverEarningValue', '0.01')}
            {field('Company charge (pence)', 'companyChargePence')}
            {field('Company charge percentage', 'companyChargePercentage', '0.01')}
          </div>
        </Card>
      </div>

      <div className={styles.saveBar}>
        <div>
          <span className={styles.saveKicker}>CONFIGURATION CONTROL</span>
          <strong>Fare engine configuration</strong>
          {config && (
            <small>
              Last updated: {new Date(config.updatedAt).toLocaleString()}
            </small>
          )}
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Fare Configuration'}
        </Button>
      </div>
    </section>
  );
}
