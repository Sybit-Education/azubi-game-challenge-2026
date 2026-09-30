export default class CreditsScene extends Phaser.Scene {
  constructor() {
    super('CreditsScene');
  }

  create() {
    let creditText = `
      SYBIT KART



    Development

    Hans Clement Solon
    Davyd Mozghov
    Berat Dalgic
    Agwad Alsayed
    Saied Tablis
    Jamin Ibrahimovic


    Art & Graphics

    Luisa Krasniqi
    Sofya Skripova


    UI/UX Design

    Sofya Skripova
    Saied Tablis
    Luisa Krasniqi


    Audio

    Sofya Skripova
    Jamin Ibrahimovic


    Accessibility

    Agwad Alsayed



    Thanks for playing!
    `;

    this.width = this.scale.width;
    this.height = this.scale.height;
    this.cameras.main.setBackgroundColor('#3E0191');

    // const headline = this.add.text(this.width / 2, this.height * 0.9, 'Credits', {
    // fontSize: '72px',
    // color: '#FEFEFE'
    // });

    const text = this.add
      .text(this.width / 2, this.height * 0.95, creditText, {
        fontSize: '34px',
        color: '#FEFEFE',
      })
      .setOrigin(0.5, 0);

    this.tweens.add({
      targets: text,
      y: -(text.height * 2),
      duration: 30000,
      ease: 'Linear',
    });
  }
}
