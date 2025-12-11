import React from 'react';
import icon from '../icon.png';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';


const features = [
  {
    icon: '📦',
    title: 'Gestion des stocks',
    desc: 'Suivi intelligent des stocks, alertes et réapprovisionnement.'
  },
  {
    icon: '📊',
    title: 'Analytique & Reporting',
    desc: 'Des tableaux de bord clairs pour piloter votre activité.'
  },
];

const benefits = [
  {
    icon: '⚡',
    title: 'Gain de temps',
    desc: 'Automatisez les tâches répétitives et concentrez-vous sur l\'essentiel.'
  },
  {
    icon: '🎯',
    title: 'Optimisation intelligente',
    desc: 'Des outils pensés pour maximiser votre productivité.'
  },
  {
    icon: '📱',
    title: 'Interface moderne',
    desc: 'Un design intuitif et responsive sur tous les appareils.'
  },
];

const HomePage: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: { xs: 6, md: 10 }, px: 2 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center" justifyContent="center">
            <Grid sx={{ textAlign: { xs: "center", md: "left" } }}>
              <Stack spacing={2} alignItems="center" textAlign="center">
                <Chip label="✨ Solution ERP intelligente" color="secondary" sx={{ fontWeight: 600, fontSize: '1rem', mb: 2 }} />
                <Typography variant="h2" fontWeight={700} gutterBottom>
                  Gérez votre entreprise <span style={{ color: 'secondary.main' }}>simplement</span>
                </Typography>
                <Typography variant="h5" sx={{ opacity: 0.9 }} gutterBottom>
                  Un ERP moderne pour piloter votre activité, vos équipes et vos finances en toute sérénité.
                </Typography>
                <Stack direction="row" spacing={2} mt={2} justifyContent="center">
                  <Button href="#features" variant="contained" color="secondary" size="large" sx={{ borderRadius: 2, fontWeight: 600 }}>
                    Découvrir les fonctionnalités
                  </Button>
                  <Button href="mailto:sales@annualerp.com" variant="outlined" color="inherit" size="large" sx={{ borderRadius: 2, fontWeight: 600 }}>
                    Contactez-nous
                  </Button>
                </Stack>
              </Stack>
            </Grid>
            <Grid sx={{ textAlign: 'center' }}>
              <Card elevation={6} sx={{ display: 'inline-block', px: 4, py: 5, bgcolor: 'background.paper', borderRadius: 4 }}>
                <CardHeader
                  avatar={<img src={icon} alt="Logo Annual ERP" style={{ height: 56, width: 56, borderRadius: 12, background: 'background.default' }} />}
                  title={<Typography variant="h5" fontWeight={700}>Annual ERP</Typography>}
                  subheader={<Typography variant="subtitle1" color="text.secondary">Votre partenaire de gestion</Typography>}
                  sx={{ pb: 0 }}
                />
                <CardContent>
                  <Typography variant="body1" color="text.secondary">
                    Simplifiez la gestion de votre entreprise avec une solution tout-en-un.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }} id="features">
        <Typography variant="h4" fontWeight={700} align="center" gutterBottom sx={{ textAlign: 'center' }}>
          Comment ça fonctionne ?
        </Typography>
        <Typography variant="subtitle1" align="center" sx={{ mb: 6, color: 'text.secondary', textAlign: 'center' }}>
          Une approche simple et efficace pour gérer votre activité
        </Typography>
        <Grid container spacing={4}>
          {features.map((f) => (
            <Grid>
              <Card elevation={3} sx={{ borderRadius: 3, textAlign: 'center', py: 4, px: 2, height: '100%' }}>
                <Box sx={{ fontSize: 40, mb: 2 }}>{f.icon}</Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>{f.title}</Typography>
                <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ bgcolor: 'grey.100', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid>
              <Stack spacing={2}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Pourquoi choisir Annual ERP ?
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Automatisez, optimisez et pilotez votre entreprise avec une solution moderne pensée pour vous.
                </Typography>
                <Stack spacing={2}>
                  {benefits.map((b) => (
                    <Box key={b.title} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ fontSize: 32, bgcolor: 'secondary.main', color: 'background.default', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>{b.icon}</Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>{b.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{b.desc}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
                <Button href="mailto:sales@annualerp.com" variant="contained" color="primary" size="large" sx={{ mt: 3, borderRadius: 2, fontWeight: 600, alignSelf: 'flex-start' }}>
                  Essayer maintenant
                </Button>
              </Stack>
            </Grid>
            <Grid>
              <Box sx={{ display: 'inline-block', bgcolor: 'background.default', borderRadius: 4, p: 4, boxShadow: 3 }}>
                <img src={icon} alt="Logo Annual ERP" style={{ height: 120, borderRadius: 16 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Divider />
      <Box component="footer" sx={{ bgcolor: 'grey.900', color: 'grey.100', textAlign: 'center', py: 2, mt: 'auto' }}>
        &copy; {new Date().getFullYear()} Annual ERP. Tous droits réservés.
      </Box>
    </Box>
  );
};

export default HomePage;
