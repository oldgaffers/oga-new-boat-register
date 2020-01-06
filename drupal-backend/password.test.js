uut = require('./password');

account = JSON.parse('{"uid":409,"name":"JCable1","pass":"$S$D.oOkSJYpbtcVkh0TXSm8BzRKYpsEHrrqPRiaDmiqr.GVE3QisdC","mail":"julian.cable@yahoo.com","theme":"","signature":"","signature_format":"filtered_html","created":1389318875,"access":1577894296,"login":1577894296,"status":1,"timezone":null,"language":"","picture":0,"init":"alison.cable@virgin.net","data":"a:6:{s:7:\\"contact\\";i:1;s:16:\\"ckeditor_default\\";s:1:\\"t\\";s:20:\\"ckeditor_show_toggle\\";s:1:\\"t\\";s:14:\\"ckeditor_width\\";s:4:\\"100%\\";s:13:\\"ckeditor_lang\\";s:2:\\"en\\";s:18:\\"ckeditor_auto_lang\\";s:1:\\"t\\";}","uuid":"98d266fb-baf8-4bd0-8d69-32ec320b1192"}');
    
test('_password_crypt should work', () => {
    expect(uut._password_crypt("sha512", 'boat2020;A', '$S$D.oOkSJYpbtcVkh0TXSm8BzRKYpsEHrrqPRiaDmiqr.GVE3QisdC')).toBe('$S$D.oOkSJYpbtcVkh0TXSm8BzRKYpsEHrrqPRiaDmiqr.GVE3QisdC');
  });

test('password accepted', () => {
    expect(uut.user_check_password('boat2020;A', account)).toBeTrue();
  });

  test('password rejected', () => {
    expect(uut.user_check_password('Boat2020;A', account)).toBeFalse();
  });
